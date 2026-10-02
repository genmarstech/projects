import { useMemo, useState } from "react";

import { Map } from "./Map";
import { ROUTES, STOPS, STOP_BY_ID } from "./network";
import {
  SERVICE_END,
  SERVICE_START,
  arrivalsAt,
  bunchesIn,
  clockLabel,
  congestion,
  fixesAt,
  seededSchedule,
} from "./sim";
import { useClock, useDarkTheme } from "./useClock";

/**
 * The seed. Change it and you get a different, equally repeatable morning.
 *
 * It is a constant rather than a control because the point of the number is
 * that two people discussing the 07:41 bunch on route 58 are discussing the
 * same one. A randomise button would quietly take that away.
 */
const SEED = 0x6e6a6961;

const RATES = [
  { label: "1×", value: 1 },
  { label: "10×", value: 10 },
  { label: "60×", value: 60 },
];

/** Minutes, rendered the way a board renders them. */
const etaLabel = (eta: number): string => {
  if (eta < 0.75) return "due";
  return `${Math.round(eta)} min`;
};

export const App = () => {
  const [playing, setPlaying] = useState(true);
  const [rate, setRate] = useState(10);
  const [selectedStopId, setSelectedStopId] = useState("adams");
  const [focusRouteId, setFocusRouteId] = useState<string | null>(null);

  const { minute, jump, reduced } = useClock(playing, rate);
  const dark = useDarkTheme();

  const schedule = useMemo(() => seededSchedule(SEED), []);
  const fixes = useMemo(() => fixesAt(schedule, minute), [schedule, minute]);
  const bunches = useMemo(() => bunchesIn(fixes, minute), [fixes, minute]);
  const arrivals = useMemo(
    () => arrivalsAt(fixes, selectedStopId, minute),
    [fixes, selectedStopId, minute],
  );

  const bunchedIds = useMemo(
    () => new Set(bunches.flatMap((b) => b.ids)),
    [bunches],
  );

  const selected = STOP_BY_ID.get(selectedStopId);
  const running = fixes.filter((f) => !f.arrived).length;
  const load = congestion(minute, "in");

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="wordmark">Njia</span>
          <span className="masthead__rule" aria-hidden="true" />
          <span className="masthead__sub">Nairobi matatu arrival board</span>
        </div>

        {/*
          This sits above the fold and stays there. A board that looks like
          this and is not connected to anything is the one dishonest thing
          this project could plausibly do, so it is said first, in the same
          type as everything else rather than in grey six-point apology.
        */}
        <p className="notice">
          <strong>Simulated.</strong> There is no operator feed behind this
          board. Every vehicle, time and delay is generated in your browser
          from a fixed seed. The routes and places are real.
        </p>
      </header>

      <section className="controls" aria-label="Clock">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>

        <div className="rates" role="group" aria-label="Speed">
          {RATES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`btn btn--chip${rate === r.value ? " is-on" : ""}`}
              onClick={() => setRate(r.value)}
              aria-pressed={rate === r.value}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label className="scrub">
          <span className="scrub__label">Time of day</span>
          <input
            type="range"
            min={SERVICE_START}
            max={SERVICE_END}
            step={1}
            value={Math.round(minute)}
            onChange={(e) => jump(Number(e.target.value))}
          />
        </label>

        <output className="clock" aria-live="off">
          {clockLabel(minute)}
        </output>
      </section>

      <div className="grid">
        <Map
          fixes={fixes}
          bunches={bunches}
          selectedStopId={selectedStopId}
          focusRouteId={focusRouteId}
          dark={dark}
          onSelectStop={setSelectedStopId}
        />

        <section className="board" aria-labelledby="board-heading">
          <div className="board__head">
            <h2 id="board-heading">{selected?.name}</h2>
            <label className="picker">
              <span className="visually-hidden">Choose a stop</span>
              <select
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
              >
                {STOPS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/*
            The board is the product and the map is the illustration, which
            is why the table carries every fact the drawing does and is
            first in the source. On a 2G connection and in a screen reader
            this is the application; the canvas is decoration that happens
            to be useful.
          */}
          <table className="arrivals">
            <caption className="visually-hidden">
              Next matatus at {selected?.name}, soonest first
            </caption>
            <thead>
              <tr>
                <th scope="col">Route</th>
                <th scope="col">Towards</th>
                <th scope="col" className="num">Due</th>
                <th scope="col">Now at</th>
              </tr>
            </thead>
            <tbody>
              {arrivals.map((a) => {
                const towards =
                  a.vehicle.direction === "out"
                    ? a.route.name.split(" — ")[0]
                    : a.route.name.split(" — ")[1];
                return (
                  <tr key={a.vehicle.id} className={bunchedIds.has(a.vehicle.id) ? "is-bunched" : undefined}>
                    <td>
                      <span
                        className="badge"
                        style={{ "--hue": a.route.hue } as React.CSSProperties}
                      >
                        {a.route.number}
                      </span>
                    </td>
                    <td className="towards">{towards}</td>
                    <td className="num">
                      <span className="eta">{etaLabel(a.eta)}</span>
                      {/*
                        The range is printed, not hidden behind a tooltip.
                        A single number for a vehicle twenty minutes out is
                        a precision the model does not have, and a board
                        that prints one teaches people to distrust all of
                        its numbers rather than just that one.
                      */}
                      {a.eta >= 0.75 && (
                        <span className="slack">±{Math.max(1, Math.round(a.slack))}</span>
                      )}
                    </td>
                    <td className="from">{a.from}</td>
                  </tr>
                );
              })}
              {arrivals.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Nothing on the way. The first vehicles leave at{" "}
                    {clockLabel(SERVICE_START)}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panels">
        <article className="panel">
          <h2>Bunching</h2>
          <p className="panel__lede">
            Vehicles on one route that have closed up on each other. From the
            kerb this is a twenty-minute wait and then three at once, on a
            route that genuinely runs every six minutes.
          </p>

          {bunches.length === 0 ? (
            <p className="panel__empty">
              Every route is holding its headway at {clockLabel(minute)}.
            </p>
          ) : (
            <ul className="bunches">
              {bunches.map((b) => {
                const route = ROUTES.find((r) => r.id === b.routeId);
                if (!route) return null;
                return (
                  <li key={`${b.routeId}-${b.direction}-${b.ids[0]}`}>
                    <span
                      className="badge"
                      style={{ "--hue": route.hue } as React.CSSProperties}
                    >
                      {route.number}
                    </span>
                    <span className="bunches__what">
                      {b.ids.length} vehicles{" "}
                      {b.direction === "in" ? "inbound" : "outbound"}
                    </span>
                    <span className="bunches__gap">
                      {b.gap < 1 ? "under a minute" : `${b.gap.toFixed(1)} min`} apart
                      <span className="bunches__plan"> · planned {route.plannedHeadway}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="panel">
          <h2>Corridors</h2>
          <p className="panel__lede">
            {running} running at {clockLabel(minute)}. Inbound traffic is{" "}
            {load < 1.1 ? "free-flowing" : `${load.toFixed(2)}× free-flow`}.
          </p>

          <ul className="legend">
            {ROUTES.map((route) => (
              <li key={route.id}>
                <button
                  type="button"
                  className={`legend__btn${focusRouteId === route.id ? " is-on" : ""}`}
                  style={{ "--hue": route.hue } as React.CSSProperties}
                  aria-pressed={focusRouteId === route.id}
                  onClick={() =>
                    setFocusRouteId((id) => (id === route.id ? null : route.id))
                  }
                >
                  <span className="legend__swatch" aria-hidden="true" />
                  <span className="legend__num">{route.number}</span>
                  <span className="legend__name">{route.name}</span>
                  <span className="legend__headway">every {route.plannedHeadway}&nbsp;min</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <footer className="foot">
        <p>
          A Genmars Tech demonstration. The map is drawn on a canvas from
          twenty-five coordinates — no tile server, no map library, no key.
          Positions are integrated from each departure every time they are
          asked for, so scrubbing the clock backwards shows exactly what that
          minute showed.
        </p>
        <p className="foot__meta">
          Seed {SEED.toString(16)} · {schedule.length} departures ·{" "}
          {reduced ? "reduced motion: stepping at 4 Hz" : "animating"}
        </p>
      </footer>
    </div>
  );
};
