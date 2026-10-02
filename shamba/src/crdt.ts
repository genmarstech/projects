/**
 * The merge. Four rules, and the reason behind each one.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE PROBLEM THIS SOLVES IS NOT "SAVE WHEN THE SIGNAL COMES BACK".
 *
 * An extension officer works a week of farms with no signal. So does a
 * colleague. Some of those farms are the same farms. When both phones
 * finally reach the server, something has to decide what the record says —
 * and whatever decides has to give the same answer on both phones, in any
 * order, however many times it runs.
 *
 * Queueing writes and replaying them in arrival order does not do that. The
 * phone that happens to find signal second overwrites the first with a
 * week-old copy of every field it never touched, and nothing anywhere
 * reports a problem. That failure is silent, which is what makes it the one
 * worth engineering against.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type ActorId = string;

/**
 * A field, and who set it when.
 *
 * ── `c` IS A LAMPORT COUNTER, NOT A TIMESTAMP, AND THAT IS LOAD-BEARING ───
 *
 * The obvious tiebreak is "latest wall clock wins". It cannot be used here.
 * A field phone's clock is set by the handset, and a handset that has been
 * off the network for a week can be wrong by days in either direction. One
 * device whose clock is three days fast would win every conflict it was
 * ever part of, for ever, and the data would look fine.
 *
 * A Lamport counter only ever says "this happened after that". It is
 * incremented on every local write and lifted to `max(mine, theirs) + 1` on
 * every merge, so an edit made in response to something always outranks it.
 * The wall clock is still carried, in `at`, purely so the interface can say
 * "Tuesday" to a human. Nothing merges on it.
 */
export type Reg<T> = {
  v: T;
  /** Lamport counter. */
  c: number;
  /** Who wrote it. The tiebreak, and never anything else. */
  a: ActorId;
  /** Wall clock, for display only. Milliseconds. */
  at: number;
};

/**
 * A tally that two people can add to at the same time.
 *
 * ⚠ A COUNT IS NOT A VALUE, AND MERGING IT LIKE ONE LOSES DATA.
 *
 *   Two officers each log four aphid sightings on the same plot offline.
 *   Under last-write-wins the record ends up saying four. Not because
 *   anything failed — because 4 and 4 merged to 4, correctly, under a rule
 *   that was the wrong rule for this field.
 *
 * So a counter is stored per actor and summed, which is the ordinary PN
 * form: each actor owns its own increments and decrements and can only
 * raise them, and the merge takes the larger of each. Eight sightings, from
 * two phones that never spoke.
 */
export type Counter = Record<ActorId, { inc: number; dec: number }>;

export const counterValue = (c: Counter): number =>
  Object.values(c).reduce((n, { inc, dec }) => n + inc - dec, 0);

export const bumpCounter = (c: Counter, actor: ActorId, by: number): Counter => {
  const mine = c[actor] ?? { inc: 0, dec: 0 };
  return {
    ...c,
    [actor]: by >= 0 ? { ...mine, inc: mine.inc + by } : { ...mine, dec: mine.dec - by },
  };
};

export const mergeCounter = (a: Counter, b: Counter): Counter => {
  const out: Counter = { ...a };
  for (const [actor, theirs] of Object.entries(b)) {
    const mine = out[actor] ?? { inc: 0, dec: 0 };
    // Max, not sum. A merge runs more than once — see `mergeRecord`.
    out[actor] = { inc: Math.max(mine.inc, theirs.inc), dec: Math.max(mine.dec, theirs.dec) };
  }
  return out;
};

/**
 * Pick the surviving write.
 *
 * Higher counter wins. On a tie the higher actor id wins — an arbitrary
 * rule, and arbitrary is the requirement: both phones must reach the same
 * answer without talking to each other, so the rule cannot depend on which
 * one is asking.
 */
export const mergeReg = <T,>(a: Reg<T>, b: Reg<T>): Reg<T> => {
  if (a.c !== b.c) return a.c > b.c ? a : b;
  if (a.a !== b.a) return a.a > b.a ? a : b;
  return a;
};

// ── The record ───────────────────────────────────────────────────────────

export const STAGES = ["Land prep", "Planted", "Vegetative", "Flowering", "Harvest"] as const;
export type Stage = (typeof STAGES)[number];

export type Farm = {
  /** Assigned on the device that created it. Never by a server. */
  id: string;
  farmer: Reg<string>;
  ward: Reg<string>;
  crop: Reg<string>;
  plotHa: Reg<number>;
  stage: Reg<Stage>;
  notes: Reg<string>;
  pests: Counter;
  /**
   * ⚠ DELETION IS A FIELD, NOT AN ABSENCE.
   *
   *   A record removed by dropping it from the map comes straight back on
   *   the next merge, carried by any replica that has not heard yet — and
   *   it comes back with whatever that replica last knew, which is worse
   *   than it never having gone. A tombstone is a write like any other and
   *   merges by the same rule.
   */
  deleted: Reg<boolean>;
};

export type Replica = {
  actor: ActorId;
  clock: number;
  farms: Record<string, Farm>;
};

/** Every field name that merges as a register. Used by the merge and the diff. */
export const REG_FIELDS = [
  "farmer",
  "ward",
  "crop",
  "plotHa",
  "stage",
  "notes",
  "deleted",
] as const;

export type RegField = (typeof REG_FIELDS)[number];

export const reg = <T,>(v: T, c: number, a: ActorId, at: number): Reg<T> => ({ v, c, a, at });

/**
 * Merge one farm into another, field by field.
 *
 * Commutative, associative and idempotent, which is not a boast — it is the
 * three properties the sync layer above is allowed to assume, and it is why
 * that layer can be as stupid as it is. An op whose acknowledgement was
 * lost gets sent again on the next flush, and applying it a second time
 * changes nothing. No sequence numbers, no dedupe table, no exactly-once.
 */
export const mergeFarm = (a: Farm, b: Farm): Farm => ({
  id: a.id,
  farmer: mergeReg(a.farmer, b.farmer),
  ward: mergeReg(a.ward, b.ward),
  crop: mergeReg(a.crop, b.crop),
  plotHa: mergeReg(a.plotHa, b.plotHa),
  stage: mergeReg(a.stage, b.stage),
  notes: mergeReg(a.notes, b.notes),
  pests: mergeCounter(a.pests, b.pests),
  deleted: mergeReg(a.deleted, b.deleted),
});

export const mergeInto = (target: Replica, incoming: Record<string, Farm>): Replica => {
  const farms = { ...target.farms };
  let clock = target.clock;

  for (const [id, theirs] of Object.entries(incoming)) {
    const mine = farms[id];
    farms[id] = mine ? mergeFarm(mine, theirs) : theirs;
    for (const f of REG_FIELDS) clock = Math.max(clock, theirs[f].c);
  }

  // Lifting the clock above everything just heard is what makes the next
  // local edit win against what it was a response to.
  return { ...target, clock: clock + 1, farms };
};

// ── The wrong merge, kept so it can be shown ─────────────────────────────

/**
 * Whole-record last-write-wins: the merge almost every sync layer ships.
 *
 * It is here to be run against the same data as the real one, because the
 * argument for field-level merging is not persuasive in the abstract. This
 * converges perfectly — both replicas agree, every time, in any order. It
 * is also wrong, and the interface shows exactly which writes it ate.
 */
export const mergeFarmWholeRecord = (a: Farm, b: Farm): Farm => {
  const rank = (f: Farm) => Math.max(...REG_FIELDS.map((k) => f[k].c));
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra > rb ? a : b;
  // Same tiebreak as a register, for the same reason.
  const aa = REG_FIELDS.map((k) => a[k].a).sort().pop() ?? "";
  const ba = REG_FIELDS.map((k) => b[k].a).sort().pop() ?? "";
  return aa >= ba ? a : b;
};

// ── Proof ────────────────────────────────────────────────────────────────

/**
 * A digest of what a replica believes.
 *
 * Two replicas that have exchanged everything must produce the same string.
 * The page prints it rather than asserting it quietly, because "they
 * converge" is a claim a reader should be able to check by looking at two
 * numbers that either match or do not.
 *
 * FNV-1a over a canonical rendering. Not a security hash and not used as
 * one — it compares two local objects and nothing signs anything.
 */
export const digest = (farms: Record<string, Farm>): string => {
  const parts: string[] = [];
  for (const id of Object.keys(farms).sort()) {
    const f = farms[id];
    parts.push(id);
    for (const k of REG_FIELDS) parts.push(`${k}=${String(f[k].v)}@${f[k].c}.${f[k].a}`);
    parts.push(`pests=${counterValue(f.pests)}`);
  }
  let h = 0x811c9dc5;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};
