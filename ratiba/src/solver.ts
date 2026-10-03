/**
 * The search, written so it can be interrupted.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * A WORKER THAT NEVER YIELDS CANNOT BE CANCELLED.
 *
 * Moving a long search onto a Web Worker keeps the main thread painting,
 * and that is usually where the thinking stops. But a worker sitting inside
 * a recursive backtracking call is not reading its message queue, so a
 * `cancel` posted to it is delivered when the search finishes — which is
 * the one moment cancelling is worthless.
 *
 * So the search is not recursive. It keeps its own stack, and `step(budget)`
 * explores a fixed number of nodes and returns. The worker calls it in a
 * `setTimeout` loop, and between chunks the queue drains and a cancel is
 * actually seen. The same property lets it report progress honestly instead
 * of posting one message at the end.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── WHAT THE SEARCH DOES ─────────────────────────────────────────────────
 *
 * Backtracking with dynamic minimum-remaining-values ordering: at every
 * node the next slot filled is whichever currently has the fewest legal
 * people. That is the whole reason this finishes. Filling the week in
 * calendar order means discovering on Friday that Monday was wrong;
 * filling the tightest slot first means the corner you would have painted
 * yourself into is the first thing you look at.
 *
 * Values are ordered least-loaded-first, so the first rota found is already
 * roughly fair and the improvement pass has less to do.
 */

import {
  type Assignment,
  type Day,
  type RoleId,
  type Rules,
  type ShiftId,
  type Slot,
  type Staff,
  DAYS,
  hoursOf,
  restBetween,
  roleWord,
  shift,
} from "./model";

/** Why one person cannot take one shift. Never a sentence — see `explain`. */
export type Why =
  | { kind: "unavailable" }
  | { kind: "same-day"; shift: ShiftId }
  | { kind: "rest"; otherDay: Day; otherShift: ShiftId; hours: number }
  | { kind: "max-hours"; would: number; cap: number }
  | { kind: "consecutive"; run: number; cap: number }
  | { kind: "nights"; cap: number };

export type Blocked = { staffId: string; why: Why };

export type Load = {
  /** One shift per day at most, so this is a slot not a list. */
  byDay: (ShiftId | null)[];
  hours: number;
  nights: number;
  weekends: number;
  offPreference: number;
};

export type Problem = {
  slots: Slot[];
  staff: Staff[];
  rules: Rules;
};

export type Outcome =
  | { status: "solved"; assignment: Assignment; nodes: number; cost: Cost; improved: number }
  | { status: "impossible"; nodes: number; reasons: Impossibility[] }
  | { status: "exhausted"; nodes: number; reasons: Impossibility[] }
  /**
   * Stopped at the cap without proving anything.
   *
   * ⚠ THIS IS NOT "NO ROTA EXISTS", AND THE INTERFACE MUST NOT SAY IT IS.
   *
   *   Backtracking is complete: given long enough it either finds a rota
   *   or proves there is none. "Long enough" on a tight week is minutes,
   *   and nobody waits. So there is a ceiling, and when it is hit the only
   *   honest report is how far it got. The diagnosis is still worth
   *   printing — the slot it kept failing on is the right place to look
   *   either way — but it is evidence, not a proof.
   */
  | { status: "budget"; nodes: number; reasons: Impossibility[] };

export type Impossibility = {
  /** The slot or scope the complaint is about. */
  scope: string;
  headline: string;
  /** One line per person, or per piece of arithmetic. */
  detail: string[];
};

export type Cost = {
  total: number;
  contractMiss: number;
  nightSpread: number;
  weekendSpread: number;
  preferenceMiss: number;
};

const emptyLoad = (): Load => ({
  byDay: Array(DAYS.length).fill(null),
  hours: 0,
  nights: 0,
  weekends: 0,
  offPreference: 0,
});

// ── Legality ─────────────────────────────────────────────────────────────

/**
 * The run of consecutive worked days this assignment would create.
 *
 * Counted outwards from the day in question rather than scanned from
 * Monday, because the only run that can break the rule is the one this
 * assignment joins.
 */
const runLength = (byDay: (ShiftId | null)[], day: Day): number => {
  let n = 1;
  for (let d = day - 1; d >= 0 && byDay[d]; d -= 1) n += 1;
  for (let d = day + 1; d < byDay.length && byDay[d]; d += 1) n += 1;
  return n;
};

export const blockedBecause = (
  person: Staff,
  load: Load,
  slot: Slot,
  rules: Rules,
): Why | null => {
  if (person.unavailable.includes(slot.day)) return { kind: "unavailable" };

  const here = load.byDay[slot.day];
  if (here) return { kind: "same-day", shift: here };

  // Rest, both ways. A night already rostered on Tuesday forbids Wednesday
  // morning, and a Wednesday morning already rostered forbids Tuesday night
  // — the constraint is symmetric and the search fills slots in neither
  // calendar order nor reverse, so both directions have to be checked.
  const before = slot.day > 0 ? load.byDay[slot.day - 1] : null;
  if (before) {
    const rest = restBetween(before, slot.shift, 1);
    if (rest < rules.restHours) {
      return { kind: "rest", otherDay: slot.day - 1, otherShift: before, hours: rest };
    }
  }
  const after = slot.day < DAYS.length - 1 ? load.byDay[slot.day + 1] : null;
  if (after) {
    const rest = restBetween(slot.shift, after, 1);
    if (rest < rules.restHours) {
      return { kind: "rest", otherDay: slot.day + 1, otherShift: after, hours: rest };
    }
  }

  if (rules.enforceMaxHours) {
    const would = load.hours + hoursOf(shift(slot.shift));
    if (would > person.maxHours) return { kind: "max-hours", would, cap: person.maxHours };
  }

  if (slot.shift === "night" && load.nights + 1 > rules.maxNights) {
    return { kind: "nights", cap: rules.maxNights };
  }

  const run = runLength(load.byDay, slot.day);
  if (run > rules.maxConsecutive) {
    return { kind: "consecutive", run, cap: rules.maxConsecutive };
  }

  return null;
};

// ── Before searching at all ──────────────────────────────────────────────

/**
 * Three counting arguments, run before the search.
 *
 * ⚠ THESE EXIST FOR THE MESSAGE, NOT FOR THE SPEED.
 *
 *   The search would discover every one of these on its own, in
 *   milliseconds, and report "no rota exists". That answer is useless to
 *   the manager holding the leave book. "Sunday night needs a pharmacist
 *   and all three of yours are unavailable" is an instruction.
 *
 * Each is a necessary condition only. Passing all three does not mean a
 * rota exists; it means these particular impossibilities are not the
 * reason, and the search has to run.
 */
export const precheck = (problem: Problem): Impossibility[] => {
  const { slots, staff, rules } = problem;
  const out: Impossibility[] = [];

  // 1. A slot nobody at all could take, ignoring every other slot.
  const byScope = new Map<string, { slot: Slot; blocked: Blocked[] }>();
  for (const slot of slots) {
    const pool = staff.filter((p) => p.role === slot.role);
    const blocked: Blocked[] = [];
    let free = 0;
    for (const person of pool) {
      const why = blockedBecause(person, emptyLoad(), slot, rules);
      if (why) blocked.push({ staffId: person.id, why });
      else free += 1;
    }
    if (free === 0) byScope.set(slot.id, { slot, blocked });
  }
  for (const { slot, blocked } of byScope.values()) {
    out.push({
      scope: slot.id,
      headline: `${DAYS[slot.day]} ${shift(slot.shift).name.toLowerCase()} has no ${roleWord(slot.role)} who can work it.`,
      detail: blocked.map((b) => `${nameOf(staff, b.staffId)} — ${explain(b.why)}`),
    });
  }

  // 2. More of a role needed on one day than exist and are available.
  for (let day = 0; day < DAYS.length; day += 1) {
    const need = new Map<RoleId, number>();
    for (const slot of slots) {
      if (slot.day !== day) continue;
      need.set(slot.role, (need.get(slot.role) ?? 0) + 1);
    }
    for (const [role, n] of need) {
      const have = staff.filter((p) => p.role === role && !p.unavailable.includes(day)).length;
      if (have < n) {
        out.push({
          scope: `${day}:${role}`,
          headline: `${DAYS[day]} needs ${n} ${roleWord(role, n)} across the day and only ${have} ${have === 1 ? "is" : "are"} available.`,
          detail: [
            "One person works at most one shift a day, so the count of shifts cannot exceed the count of people.",
            ...staff
              .filter((p) => p.role === role && p.unavailable.includes(day))
              .map((p) => `${p.name} is unavailable on ${DAYS[day]}.`),
          ],
        });
      }
    }
  }

  // 3. Hours. The week's demand for a role against the ceilings of the
  //    people who hold it. This is the one that catches an understaffed
  //    rota that looks fine day by day.
  if (rules.enforceMaxHours) {
    const demand = new Map<RoleId, number>();
    for (const slot of slots) {
      demand.set(slot.role, (demand.get(slot.role) ?? 0) + hoursOf(shift(slot.shift)));
    }
    for (const [role, hours] of demand) {
      const pool = staff.filter((p) => p.role === role);
      const ceiling = pool.reduce((n, p) => n + p.maxHours, 0);
      if (ceiling < hours) {
        out.push({
          scope: `week:${role}`,
          headline: `The week needs ${hours} ${roleWord(role)} hours and the contracts allow ${ceiling}.`,
          detail: [
            ...pool.map((p) => `${p.name} — up to ${p.maxHours} h`),
            `Short by ${hours - ceiling} hours. Either the cover comes down or somebody's ceiling goes up.`,
          ],
        });
      }
    }
  }

  return out;
};

const nameOf = (staff: Staff[], id: string) => staff.find((p) => p.id === id)?.name ?? id;

const shiftName = (id: ShiftId) => shift(id).name.toLowerCase();

export const explain = (why: Why): string => {
  switch (why.kind) {
    case "unavailable":
      return "on leave that day";
    case "same-day":
      return `already on the ${shiftName(why.shift)} that day`;
    case "rest":
      return `only ${why.hours} h rest around the ${shiftName(why.otherShift)} on ${DAYS[why.otherDay]}`;
    case "max-hours":
      return `would reach ${why.would} h against a ${why.cap} h ceiling`;
    case "consecutive":
      return `would make ${why.run} days in a row, over the limit of ${why.cap}`;
    case "nights":
      return `already has ${why.cap} nights`;
  }
};

// ── Cost ─────────────────────────────────────────────────────────────────

const spread = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
};

export const costOf = (staff: Staff[], loads: Record<string, Load>): Cost => {
  const contractMiss = staff.reduce(
    (n, p) => n + Math.abs((loads[p.id]?.hours ?? 0) - p.contract),
    0,
  );
  const nightSpread = spread(staff.map((p) => loads[p.id]?.nights ?? 0));
  const weekendSpread = spread(staff.map((p) => loads[p.id]?.weekends ?? 0));
  const preferenceMiss = staff.reduce((n, p) => n + (loads[p.id]?.offPreference ?? 0), 0);

  /*
   * The weights, and the one that is doing the work.
   *
   * Contract hours dominate because an hour not worked is money somebody
   * was promised, and an hour over is money the business did not budget.
   * Night and weekend spread are squared deviations, so the cost of giving
   * one person four nights while another has none rises faster than the
   * cost of a one-night difference — which is how people actually feel it.
   * Preference is last and small: it is a courtesy, and a rota that honours
   * every preference by paying somebody for twelve hours they did not work
   * is not a better rota.
   */
  const total = contractMiss * 3 + nightSpread * 6 + weekendSpread * 4 + preferenceMiss;
  return { total, contractMiss, nightSpread, weekendSpread, preferenceMiss };
};

// ── The solver ───────────────────────────────────────────────────────────

type Frame = { slot: Slot; candidates: string[]; tried: number; assigned: boolean };

export type Progress = {
  nodes: number;
  depth: number;
  filled: number;
  total: number;
  phase: "search" | "improve" | "done";
};

/**
 * How many nodes before the search gives up and says so.
 *
 * Chosen by measurement, not by feel: every preset in `data.ts` that has a
 * rota finds one inside a hundred nodes, and the tight weeks that have none
 * are proved impossible inside a few thousand. Two hundred thousand is two
 * orders of magnitude of headroom for a week nobody has thought of yet, and
 * about a second and a half of searching.
 */
export const NODE_CAP = 200_000;

export class Solver {
  readonly problem: Problem;
  private readonly byId: Map<string, Staff>;
  private readonly pool: Map<string, Staff[]>;

  private assignment: Assignment = {};
  private loads: Record<string, Load> = {};
  private stack: Frame[] = [];
  private needFrame = true;
  private nodes = 0;
  private finished: Outcome | null = null;

  /** Slot id → how often the search found it unfillable. The diagnosis. */
  private chokes = new Map<string, number>();
  private deepest: { slot: Slot; blocked: Blocked[] } | null = null;
  private deepestAt = -1;

  constructor(problem: Problem) {
    this.problem = problem;
    this.byId = new Map(problem.staff.map((p) => [p.id, p]));
    this.pool = new Map();
    for (const slot of problem.slots) {
      if (!this.pool.has(slot.role)) {
        this.pool.set(
          slot.role,
          problem.staff.filter((p) => p.role === slot.role),
        );
      }
    }
    for (const person of problem.staff) this.loads[person.id] = emptyLoad();
    for (const slot of problem.slots) this.assignment[slot.id] = null;
  }

  private place(slot: Slot, staffId: string) {
    const load = this.loads[staffId];
    const person = this.byId.get(staffId);
    load.byDay[slot.day] = slot.shift;
    load.hours += hoursOf(shift(slot.shift));
    if (slot.shift === "night") load.nights += 1;
    if (slot.day >= 5) load.weekends += 1;
    if (person && person.prefers.length > 0 && !person.prefers.includes(slot.shift)) {
      load.offPreference += 1;
    }
    this.assignment[slot.id] = staffId;
  }

  private lift(slot: Slot) {
    const staffId = this.assignment[slot.id];
    if (!staffId) return;
    const load = this.loads[staffId];
    const person = this.byId.get(staffId);
    load.byDay[slot.day] = null;
    load.hours -= hoursOf(shift(slot.shift));
    if (slot.shift === "night") load.nights -= 1;
    if (slot.day >= 5) load.weekends -= 1;
    if (person && person.prefers.length > 0 && !person.prefers.includes(slot.shift)) {
      load.offPreference -= 1;
    }
    this.assignment[slot.id] = null;
  }

  private legalFor(slot: Slot): { ok: string[]; blocked: Blocked[] } {
    const ok: string[] = [];
    const blocked: Blocked[] = [];
    for (const person of this.pool.get(slot.role) ?? []) {
      const why = blockedBecause(person, this.loads[person.id], slot, this.problem.rules);
      if (why) blocked.push({ staffId: person.id, why });
      else ok.push(person.id);
    }
    return { ok, blocked };
  }

  /** The unassigned slot with the fewest legal people. See the banner. */
  private selectSlot(): { slot: Slot; candidates: string[]; blocked: Blocked[] } | null {
    let best: { slot: Slot; candidates: string[]; blocked: Blocked[] } | null = null;
    for (const slot of this.problem.slots) {
      if (this.assignment[slot.id]) continue;
      const { ok, blocked } = this.legalFor(slot);
      if (!best || ok.length < best.candidates.length) {
        best = { slot, candidates: ok, blocked };
        if (ok.length === 0) break; // nothing can beat zero
      }
    }
    if (!best) return null;

    // Least-loaded first, then whoever asked for this shift. Ordering
    // values does not change which rotas exist — it changes which one is
    // found first, and a first answer that is already roughly fair leaves
    // the improvement pass less to undo.
    const { slot } = best;
    best.candidates.sort((a, b) => {
      const pa = this.byId.get(a);
      const pb = this.byId.get(b);
      const fa = this.loads[a].hours / Math.max(1, pa?.contract ?? 1);
      const fb = this.loads[b].hours / Math.max(1, pb?.contract ?? 1);
      if (Math.abs(fa - fb) > 0.001) return fa - fb;
      const wa = pa?.prefers.includes(slot.shift) ? 0 : 1;
      const wb = pb?.prefers.includes(slot.shift) ? 0 : 1;
      return wa - wb;
    });
    return best;
  }

  private backtrack() {
    const frame = this.stack.pop();
    if (frame?.assigned) this.lift(frame.slot);
    this.needFrame = false;
  }

  get outcome(): Outcome | null {
    return this.finished;
  }

  get progress(): Progress {
    const filled = Object.values(this.assignment).filter(Boolean).length;
    return {
      nodes: this.nodes,
      depth: this.stack.length,
      filled,
      total: this.problem.slots.length,
      phase: this.finished ? "done" : "search",
    };
  }

  /** Explore at most `budget` nodes, then return so the thread can breathe. */
  step(budget: number): Outcome | null {
    if (this.finished) return this.finished;

    for (let i = 0; i < budget; i += 1) {
      if (this.nodes >= NODE_CAP) {
        this.finished = { status: "budget", nodes: this.nodes, reasons: this.diagnose() };
        return this.finished;
      }
      if (this.stack.length === this.problem.slots.length) {
        this.finished = {
          status: "solved",
          assignment: { ...this.assignment },
          nodes: this.nodes,
          cost: costOf(this.problem.staff, this.loads),
          improved: 0,
        };
        return this.finished;
      }

      if (this.needFrame) {
        const picked = this.selectSlot();
        if (!picked) {
          this.needFrame = false;
          continue;
        }
        if (picked.candidates.length === 0) {
          this.noteChoke(picked.slot, picked.blocked);
          this.backtrack();
          if (this.stack.length === 0 && this.nodes > 0) return this.exhaust();
          continue;
        }
        this.stack.push({
          slot: picked.slot,
          candidates: picked.candidates,
          tried: 0,
          assigned: false,
        });
      }

      const frame = this.stack[this.stack.length - 1];
      if (!frame) return this.exhaust();

      if (frame.assigned) this.lift(frame.slot);

      if (frame.tried >= frame.candidates.length) {
        frame.assigned = false;
        this.backtrack();
        if (this.stack.length === 0) return this.exhaust();
        continue;
      }

      this.place(frame.slot, frame.candidates[frame.tried]);
      frame.tried += 1;
      frame.assigned = true;
      this.nodes += 1;
      this.needFrame = true;
    }

    return null;
  }

  private noteChoke(slot: Slot, blocked: Blocked[]) {
    this.chokes.set(slot.id, (this.chokes.get(slot.id) ?? 0) + 1);
    // Keep the conflict from the deepest point reached: that is the one
    // where the most of the week was already committed, so its list of
    // refusals is the most specific thing the search can report.
    if (this.stack.length > this.deepestAt) {
      this.deepestAt = this.stack.length;
      this.deepest = { slot, blocked };
    }
  }

  private exhaust(): Outcome {
    this.finished = {
      status: "exhausted",
      nodes: this.nodes,
      reasons: this.diagnose(),
    };
    return this.finished;
  }

  /**
   * What to say when the search ran out of rotas.
   *
   * Not "no solution found". The slot the search kept failing on, how often
   * it failed there, and — from the deepest point reached — the specific
   * rule that removed each person from it.
   */
  diagnose(): Impossibility[] {
    const out: Impossibility[] = [];
    const ranked = [...this.chokes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

    if (this.deepest) {
      const { slot, blocked } = this.deepest;
      out.push({
        scope: slot.id,
        headline: `Every rota the search tried left ${DAYS[slot.day]} ${shift(slot.shift).name.toLowerCase()} without a ${roleWord(slot.role)}.`,
        detail: blocked.map((b) => `${nameOf(this.problem.staff, b.staffId)} — ${explain(b.why)}`),
      });
    }

    if (ranked.length > 0) {
      out.push({
        scope: "choke",
        headline: "The shifts the search could not fill, by how often.",
        detail: ranked.map(([id, n]) => {
          const slot = this.problem.slots.find((s) => s.id === id);
          return slot
            ? `${DAYS[slot.day]} ${shift(slot.shift).name.toLowerCase()}, ${roleWord(slot.role)} — ${n} times`
            : `${id} — ${n} times`;
        }),
      });
    }

    out.push({
      scope: "advice",
      headline: "Nothing in the rules can be bent by the solver.",
      detail: [
        "Relaxing one is a decision somebody makes, which is why they are switches on the page and not fallbacks in the code.",
        "Try the eleven-hour rest first: it is the rule that turns a per-day choice into a chain down the week.",
      ],
    });

    return out;
  }

  /**
   * Local search over the rota the backtracker found.
   *
   * ── WHY A SECOND PASS AND NOT ONE CLEVERER SEARCH ────────────────────────
   *
   * The hard constraints are what make a rota legal and the soft ones are
   * what make it decent, and they want completely different algorithms. A
   * backtracker is good at "is there any arrangement at all" and bad at
   * "which arrangement is kindest" — it would have to enumerate the legal
   * ones to compare them, and there are a great many.
   *
   * Swapping two people between two shifts, keeping only swaps that are
   * legal and cheaper, is good at the second question and cannot answer the
   * first at all. So: backtrack to legal, then hill-climb to fair. Every
   * state the climb visits is legal by construction, which is why there is
   * no repair step.
   */
  improve(rounds: number, seed = 7): number {
    if (!this.finished || this.finished.status !== "solved") return 0;

    let a = seed >>> 0;
    const rand = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const slots = this.problem.slots;
    let cost = costOf(this.problem.staff, this.loads).total;
    let taken = 0;

    for (let i = 0; i < rounds; i += 1) {
      const s1 = slots[Math.floor(rand() * slots.length)];
      const s2 = slots[Math.floor(rand() * slots.length)];
      if (s1.id === s2.id || s1.role !== s2.role) continue;

      const p1 = this.assignment[s1.id];
      const p2 = this.assignment[s2.id];
      if (!p1 || !p2 || p1 === p2) continue;

      this.lift(s1);
      this.lift(s2);

      const ok1 = blockedBecause(this.byId.get(p2)!, this.loads[p2], s1, this.problem.rules);
      const ok2 = ok1 ? null : blockedBecause(this.byId.get(p1)!, this.loads[p1], s2, this.problem.rules);

      if (ok1 || ok2) {
        this.place(s1, p1);
        this.place(s2, p2);
        continue;
      }

      this.place(s1, p2);
      this.place(s2, p1);
      const next = costOf(this.problem.staff, this.loads).total;

      if (next < cost - 1e-9) {
        cost = next;
        taken += 1;
      } else {
        this.lift(s1);
        this.lift(s2);
        this.place(s1, p1);
        this.place(s2, p2);
      }
    }

    this.finished = {
      status: "solved",
      assignment: { ...this.assignment },
      nodes: this.nodes,
      cost: costOf(this.problem.staff, this.loads),
      improved: taken,
    };
    return taken;
  }

  loadsSnapshot(): Record<string, Load> {
    return JSON.parse(JSON.stringify(this.loads)) as Record<string, Load>;
  }
}
