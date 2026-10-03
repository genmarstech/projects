import { useEffect, useMemo, useState } from "react";

import { slotsFor } from "./build";
import { PRESETS, STAFF, withLeave } from "./data";
import {
  type Rules,
  type ShiftId,
  DAYS,
  DEFAULT_RULES,
  ROLES,
  SHIFTS,
  hoursOf,
  shift,
} from "./model";
import { NODE_CAP } from "./solver";
import { useSolver } from "./useSolver";

const SHIFT_ORDER: ShiftId[] = ["morning", "evening", "night"];

export const App = () => {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const solver = useSolver();
  const { solve } = solver;

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const staff = useMemo(() => withLeave(preset), [preset]);
  const slots = useMemo(() => slotsFor(preset), [preset]);

  // Solve on arrival and whenever the question changes. A page that opens
  // with an empty grid and a Solve button makes the reader do the work of
  // discovering what it is.
  useEffect(() => {
    solve(presetId, rules);
  }, [presetId, rules, solve]);

  const assignment = solver.outcome?.status === "solved" ? solver.outcome.assignment : null;
  const nameOf = (id: string | null | undefined) =>
    id ? (staff.find((p) => p.id === id)?.name ?? id) : null;

  const reasons =
    solver.precheck.length > 0
      ? solver.precheck
      : solver.outcome && solver.outcome.status !== "solved"
        ? solver.outcome.reasons
        : [];

  const totalHours = slots.reduce((n, s) => n + hoursOf(shift(s.shift)), 0);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="wordmark">Ratiba</span>
          <span className="masthead__rule" aria-hidden="true" />
          <span className="masthead__sub">
            a duty roster that explains why it cannot be built
          </span>
        </div>
        <p className="notice">
          Forty-two shifts over seven days at a 24-hour pharmacy, filled from
          ten people with contracts, qualifications, leave and a legal right
          to rest. A Genmars Tech demonstration — the branch and the staff are
          invented, the constraints are the real ones.
        </p>
      </header>

      <section className="setup">
        <div className="presets" role="group" aria-label="Week">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset${p.id === presetId ? " is-on" : ""}`}
              aria-pressed={p.id === presetId}
              onClick={() => setPresetId(p.id)}
            >
              <strong>{p.name}</strong>
              <span>{p.blurb}</span>
            </button>
          ))}
        </div>

        <div className="rules">
          <h2>Rules</h2>
          {/*
            Switches, not fallbacks.
            
            A solver that quietly relaxed the rest period to produce an
            answer would be making an employment-law decision on behalf of
            whoever read its output. Nothing here can be bent by the code:
            when no rota exists the page says which rule stopped it, and a
            person decides.
          */}
          <label className="rule">
            <span>Rest between shifts</span>
            <select
              value={rules.restHours}
              onChange={(e) => setRules((r) => ({ ...r, restHours: Number(e.target.value) }))}
            >
              <option value={11}>11 hours (statutory daily rest)</option>
              <option value={9}>9 hours</option>
              <option value={0}>None</option>
            </select>
          </label>

          <label className="rule">
            <span>Days in a row</span>
            <select
              value={rules.maxConsecutive}
              onChange={(e) => setRules((r) => ({ ...r, maxConsecutive: Number(e.target.value) }))}
            >
              <option value={5}>at most 5</option>
              <option value={6}>at most 6</option>
              <option value={7}>no limit</option>
            </select>
          </label>

          <label className="rule">
            <span>Nights per person</span>
            <select
              value={rules.maxNights}
              onChange={(e) => setRules((r) => ({ ...r, maxNights: Number(e.target.value) }))}
            >
              <option value={2}>at most 2</option>
              <option value={3}>at most 3</option>
              <option value={7}>no limit</option>
            </select>
          </label>

          <label className="rule rule--check">
            <input
              type="checkbox"
              checked={rules.enforceMaxHours}
              onChange={(e) => setRules((r) => ({ ...r, enforceMaxHours: e.target.checked }))}
            />
            <span>Hold contracted ceilings</span>
          </label>
        </div>
      </section>

      <section className="status" aria-live="polite">
        {solver.running ? (
          <>
            <span className="pill pill--busy">searching</span>
            <span className="status__text">
              {solver.progress
                ? `${solver.progress.nodes.toLocaleString()} nodes · ${solver.progress.filled} of ${solver.progress.total} shifts placed`
                : "starting"}
            </span>
            <button type="button" className="btn" onClick={solver.cancel}>
              Cancel
            </button>
          </>
        ) : solver.outcome?.status === "solved" ? (
          <>
            <span className="pill pill--ok">rostered</span>
            <span className="status__text">
              {solver.outcome.nodes} nodes in {solver.elapsed.toFixed(0)} ms, then{" "}
              {solver.swaps} improving swap{solver.swaps === 1 ? "" : "s"}. Contract
              hours missed by {solver.outcome.cost.contractMiss} across {staff.length}{" "}
              people, over {totalHours} rostered hours.
            </span>
          </>
        ) : solver.outcome?.status === "budget" ? (
          <>
            <span className="pill pill--warn">gave up</span>
            <span className="status__text">
              Stopped at {NODE_CAP.toLocaleString()} nodes.{" "}
              <strong>This is not a proof that no rota exists</strong> — only
              that one was not found in the time allowed.
            </span>
          </>
        ) : solver.outcome ? (
          <>
            <span className="pill pill--bad">no rota exists</span>
            <span className="status__text">
              Proved in {solver.outcome.nodes} nodes. The search is complete,
              so this is a proof and not a timeout.
            </span>
          </>
        ) : (
          <span className="status__text">…</span>
        )}
      </section>

      {reasons.length > 0 && (
        <section className="why" aria-labelledby="why-heading">
          <h2 id="why-heading">Why</h2>
          {reasons.map((r) => (
            <article key={r.scope} className="why__item">
              <h3>{r.headline}</h3>
              <ul>
                {r.detail.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      <section className="grid-wrap" aria-labelledby="rota-heading">
        <h2 id="rota-heading" className="visually-hidden">
          The rota
        </h2>
        <table className="rota">
          <thead>
            <tr>
              <th scope="col">Shift</th>
              {DAYS.map((d, i) => (
                <th key={d} scope="col" className={i >= 5 ? "weekend" : undefined}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_ORDER.map((id) => {
              const s = shift(id);
              return (
                <tr key={id}>
                  <th scope="row">
                    <span className="rota__shift">{s.name}</span>
                    <span className="rota__hours">
                      {String(s.start).padStart(2, "0")}:00–
                      {String(s.end % 24).padStart(2, "0")}:00 · {hoursOf(s)} h
                    </span>
                  </th>
                  {DAYS.map((_, day) => {
                    const cell = slots.filter((x) => x.day === day && x.shift === id);
                    return (
                      <td key={day} className={day >= 5 ? "weekend" : undefined}>
                        {cell.map((slot) => {
                          const who = nameOf(assignment?.[slot.id]);
                          return (
                            <span
                              key={slot.id}
                              className={`cell${who ? "" : " cell--empty"}`}
                              title={ROLES[slot.role].name}
                            >
                              <span className="cell__role">{ROLES[slot.role].short}</span>
                              <span className="cell__who">{who ?? "—"}</span>
                            </span>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="people" aria-labelledby="people-heading">
        <h2 id="people-heading">Who ends up with what</h2>
        <table className="staff">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col" className="num">Hours</th>
              <th scope="col" className="num">Contract</th>
              <th scope="col" className="num">Nights</th>
              <th scope="col" className="num">Weekend</th>
              <th scope="col">Off preference</th>
              <th scope="col">Away</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((p) => {
              const load = solver.loads[p.id];
              const hours = load?.hours ?? 0;
              const miss = hours - p.contract;
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="muted">{ROLES[p.role].name}</td>
                  <td className="num">
                    {hours}
                    {miss !== 0 && (
                      <span className={miss > 0 ? "over" : "under"}>
                        {miss > 0 ? `+${miss}` : miss}
                      </span>
                    )}
                  </td>
                  <td className="num muted">{p.contract}</td>
                  <td className="num">{load?.nights ?? 0}</td>
                  <td className="num">{load?.weekends ?? 0}</td>
                  <td className="muted">
                    {p.prefers.length === 0
                      ? "no preference"
                      : `${load?.offPreference ?? 0} of ${hours ? Math.round(hours / 8) : 0} off ${p.prefers.join(" / ")}`}
                  </td>
                  <td className="muted">
                    {p.unavailable.length === 0
                      ? "—"
                      : p.unavailable.map((d) => DAYS[d]).join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <footer className="foot">
        <p>
          Backtracking with dynamic minimum-remaining-values ordering: at
          every node the next shift filled is whichever currently has the
          fewest legal people. That is the whole reason it finishes. Filling
          the week in calendar order means discovering on Friday that Monday
          was wrong; filling the tightest shift first means the corner you
          would have painted yourself into is the first thing you look at.
        </p>
        <p>
          The search runs in a Web Worker, in chunks, yielding between them —
          which is the only reason Cancel works. A worker inside a recursive
          search is not reading its message queue, so a cancel posted to it
          arrives when the search finishes.
        </p>
        <p className="foot__meta">
          {STAFF.length} staff · {slots.length} shifts ·{" "}
          {SHIFTS.length} templates · node cap {NODE_CAP.toLocaleString()}
        </p>
      </footer>
    </div>
  );
};
