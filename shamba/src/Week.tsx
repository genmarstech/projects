import { useMemo, useState } from "react";

import { counterValue } from "./crdt";
import { ACTORS, WEEK } from "./data";
import { actorName, dayName, replay } from "./week";

export const Week = () => {
  const [day, setDay] = useState(7);
  const state = useMemo(() => replay(day), [day]);

  const converges = state.digests.field === state.digests.fieldReversed;
  const ids = Object.keys(state.field).sort();

  return (
    <div className="week">
      <section className="week__intro">
        <h2>Seven days, three devices, no signal</h2>
        <p>
          Two extension officers and a shared clinic tablet work the same six
          farms for a week. None of them can reach the server, and none of
          them can reach each other. On Sunday evening all three reconnect at
          once.
        </p>
        <p>
          The same edits are merged twice: once field by field, and once a
          whole record at a time — the rule most sync layers ship.{" "}
          <strong>Both converge.</strong> One of them is eating observations.
        </p>

        <label className="scrub">
          <span className="scrub__label">Through</span>
          <input
            type="range"
            min={1}
            max={7}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
          />
          <output className="scrub__out">
            {dayName(day)} · {state.applied} edits
          </output>
        </label>
      </section>

      <section className="week__grid">
        <article className="card">
          <h3>What each device holds</h3>
          <p className="card__lede">
            Having spoken to nobody. Each has its own Lamport counter, and
            the counters collide — which is exactly why the tiebreak cannot
            be a wall clock.
          </p>
          <ul className="devices">
            {Object.entries(ACTORS).map(([id, who]) => {
              const mine = WEEK.filter((e) => e.actor === id && e.day <= day);
              return (
                <li key={id}>
                  <div className="devices__who">
                    <strong>{who.name}</strong>
                    <span>{who.role}</span>
                  </div>
                  <span className="devices__n">
                    {mine.length} edit{mine.length === 1 ? "" : "s"} queued
                  </span>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="card">
          <h3>Convergence</h3>
          <p className="card__lede">
            A digest of the merged state. Merged A→B→C, then C→B→A. If the
            order could change the answer, these two would differ.
          </p>
          <dl className="meter">
            <div>
              <dt>Field-level, A→B→C</dt>
              <dd className="mono">{state.digests.field}</dd>
            </div>
            <div>
              <dt>Field-level, C→B→A</dt>
              <dd className="mono">{state.digests.fieldReversed}</dd>
            </div>
            <div>
              <dt>Whole-record</dt>
              <dd className="mono">{state.digests.record}</dd>
            </div>
          </dl>
          <p className={`verdict${converges ? " is-good" : ""}`}>
            {converges
              ? "Order-independent. Both orders produced the same state."
              : "The two orders disagree, which would be a bug in the merge."}
          </p>
          {/*
            The whole-record digest is deliberately NOT flagged as a
            failure. It converges too. Marking it red here would make the
            page argue the wrong thing — the complaint is not that the rule
            is inconsistent, it is that the rule is consistently wrong.
          */}
          <p className="verdict is-good">
            Whole-record converges as well. Consistency is not the
            disagreement.
          </p>
        </article>
      </section>

      <section className="card card--wide">
        <h3>
          What the whole-record merge discarded
          <span className="count">{state.lost.length}</span>
        </h3>
        <p className="card__lede">
          Every one of these was written down by somebody standing on the
          farm. Under whole-record last-write-wins each is replaced by an
          older value from a different device, with nothing logged and
          nothing to notice.
        </p>

        {state.lost.length === 0 ? (
          <p className="empty">
            Nothing lost yet — no two devices have touched the same record.
          </p>
        ) : (
          <table className="lost">
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Field</th>
                <th scope="col">Written</th>
                <th scope="col">Whole-record gives</th>
                <th scope="col">Who, when</th>
              </tr>
            </thead>
            <tbody>
              {state.lost.map((l) => (
                <tr key={`${l.farmId}-${l.field}`}>
                  <td className="mono">{l.farmId}</td>
                  <td>{l.field}</td>
                  <td className="kept">{l.kept}</td>
                  <td className="gone">{l.instead}</td>
                  <td className="who">
                    {l.author}
                    {l.day > 0 && <span> · {dayName(l.day)}</span>}
                    {l.why && <span className="why">{l.why}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card card--wide">
        <h3>The merged record, field by field</h3>
        <table className="merged">
          <thead>
            <tr>
              <th scope="col">Farmer</th>
              <th scope="col">Stage</th>
              <th scope="col" className="num">Plot (ha)</th>
              <th scope="col" className="num">Pests</th>
              <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {ids.map((id) => {
              const f = state.field[id];
              const r = state.record[id];
              return (
                <tr key={id}>
                  <td>{f.farmer.v}</td>
                  <td className={f.stage.v !== r.stage.v ? "differs" : undefined}>
                    {f.stage.v}
                  </td>
                  <td className={`num${f.plotHa.v !== r.plotHa.v ? " differs" : ""}`}>
                    {f.plotHa.v}
                  </td>
                  <td
                    className={`num${
                      counterValue(f.pests) !== counterValue(r.pests) ? " differs" : ""
                    }`}
                  >
                    {counterValue(f.pests)}
                  </td>
                  <td className={`notes${f.notes.v !== r.notes.v ? " differs" : ""}`}>
                    {f.notes.v}
                    <span className="by">— {actorName(f.notes.a)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="card__foot">
          Cells marked with a rule underneath are the ones the whole-record
          merge would answer differently.
        </p>
      </section>

      <section className="card card--wide">
        <h3>The week, as it was entered</h3>
        <ol className="diary">
          {WEEK.filter((e) => e.day <= day).map((e, i) => (
            <li key={`${e.day}-${e.actor}-${e.farmId}-${i}`}>
              <span className="diary__day">{dayName(e.day)}</span>
              <span className="diary__who">{ACTORS[e.actor].name}</span>
              <span className="diary__what">
                <span className="mono">{e.farmId}</span>{" "}
                {e.pests !== undefined ? `tally +${e.pests}` : `${e.field} ←`}{" "}
                {e.value !== undefined && <em>{String(e.value)}</em>}
              </span>
              <span className="diary__why">{e.why}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
