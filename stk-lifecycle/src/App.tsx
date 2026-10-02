import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  POLL_EVERY,
  RESULT_CODES,
  SCENARIOS,
  frameAt,
  runLength,
  type Belief,
  type Scenario,
  type Strategy,
  type WireEvent,
} from "./lifecycle";

/**
 * The screen is the argument.
 *
 * Two tills consume one event stream. The left believes what it is told; the
 * right asks. They sit side by side so the moment they disagree is a thing
 * you watch happen rather than a paragraph claiming it would.
 *
 * ── IT OPENS IN A WORKING STATE, NOT AN EMPTY ONE ──────────────────────────
 *
 * The first scenario is selected and the clock sits a few seconds in, so the
 * first frame anybody sees — a shared link, a thumbnail, a skim — already
 * shows a till mid-push rather than a blank shell waiting to be pressed.
 */

const STATE_WORDS: Record<Belief, string> = {
  waiting: "Waiting for the customer",
  paid: "Paid",
  failed: "Not paid",
  expired: "Timed out",
  unknown: "No answer",
};

const TRUTH_WORDS: Record<string, string> = {
  pending: "Nobody has paid yet",
  paid: "The money has moved",
  failed: "The payment failed",
  expired: "The prompt timed out",
};

const HOW: Record<Strategy, { name: string; how: string }> = {
  callback: {
    name: "Till A",
    how: "Believes the callback",
  },
  query: {
    name: "Till B",
    how: "Asks Safaricom, every " + POLL_EVERY + "s",
  },
};

function fmt(t: number): string {
  return t.toFixed(1) + "s";
}

/** Who a hop is between, in the shape a log line would use. */
function hop(e: WireEvent): string {
  const names: Record<string, string> = {
    till: "till",
    daraja: "daraja",
    customer: "handset",
    attacker: "unknown host",
  };
  return e.from === e.to ? names[e.from] : `${names[e.from]} → ${names[e.to]}`;
}

export default function App() {
  const [slug, setSlug] = useState(SCENARIOS[0].slug);
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.slug === slug) ?? SCENARIOS[0],
    [slug],
  );
  const length = runLength(scenario);

  // Opens mid-push rather than at zero — see the note above.
  const [t, setT] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(4);

  // The clock. requestAnimationFrame rather than setInterval so the timeline
  // advances with the paint and a dropped frame costs smoothness, not
  // accuracy — the elapsed time is read from the clock, not counted in ticks.
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const step = (now: number) => {
      const dt = ((now - last.current) / 1000) * rate;
      last.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= length) {
          setPlaying(false);
          return length;
        }
        return next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing, rate, length]);

  const pick = useCallback((next: string) => {
    setSlug(next);
    setT(3);
    setPlaying(false);
  }, []);

  const replay = useCallback(() => {
    setT(0);
    setPlaying(true);
  }, []);

  const frame = frameAt(scenario, t);
  const over = t >= length;

  return (
    <div className="shell">
      <Masthead />

      <section className="section" aria-labelledby="pick">
        <div className="sectionHead">
          <p className="eyebrow">Five ways it goes</p>
          <h2 id="pick">Pick one and watch both tills</h2>
          <p>
            Every scenario is a real failure mode, not an edge case invented to
            make a point. Three of the five end with the two tills disagreeing,
            and one of those three is a theft.
          </p>
        </div>

        <div className="scenarios">
          {SCENARIOS.map((s) => (
            <ScenarioCard
              key={s.slug}
              scenario={s}
              active={s.slug === slug}
              onPick={() => pick(s.slug)}
            />
          ))}
        </div>

        <Transport
          t={t}
          length={length}
          playing={playing}
          rate={rate}
          onPlay={() => (over ? replay() : setPlaying(!playing))}
          onScrub={(v) => {
            setPlaying(false);
            setT(v);
          }}
          onRate={setRate}
          onReplay={replay}
          over={over}
        />

        <div className="truthBar">
          <span className={`pill p-${frame.truth}`}>{frame.truth}</span>
          <span className="truthLabel">
            <strong>What is actually true:</strong>{" "}
            {TRUTH_WORDS[frame.truth] ?? frame.truth}
          </span>
        </div>

        <div className="tills">
          <Till
            strategy="callback"
            belief={frame.belief.callback}
            truth={frame.truth}
            detail={callbackDetail(frame.belief.callback, frame.seen)}
          />
          <Till
            strategy="query"
            belief={frame.belief.query}
            truth={frame.truth}
            detail={queryDetail(frame.belief.query, frame.polls)}
          />
        </div>

        {frame.diverged && (
          <p className="divergence">
            <span aria-hidden="true">⚠</span>
            <span>
              <strong>The two tills now disagree.</strong> Same push, same
              second, same customer standing at the counter — and the only
              difference is which one of them asked.
            </span>
          </p>
        )}

        {over && (
          <div className="verdicts">
            <div className="verdict">
              <span className="verdictWho">Till A · callback</span>
              <span className="verdictWhat">{scenario.verdict.callback}</span>
            </div>
            <div className="verdict">
              <span className="verdictWho">Till B · query</span>
              <span className="verdictWhat">{scenario.verdict.query}</span>
            </div>
          </div>
        )}

        <Wire scenario={scenario} frame={frame} />
      </section>

      <Reference />
      <Close />
    </div>
  );
}

function Masthead() {
  return (
    <header className="masthead">
      <p className="eyebrow">Genmars · R&amp;D</p>
      <h1>Waiting for the Customer</h1>
      <p className="standfirst">
        What actually happens between a cashier pressing <em>Charge</em> and
        money arriving — and why the callback cannot be trusted to tell you.
      </p>
      <p className="thesis">
        A till can learn the fate of an M-Pesa STK push two ways: wait to be
        told, or ask. They are not equivalent, and the difference is not a
        preference. The callback URL has to be public for Safaricom to reach
        it, so anybody can reach it; and it is one delivery over the open
        internet to a box that sometimes restarts.{" "}
        <strong>
          The query is the source of truth. The callback is only a hint that it
          is worth asking early.
        </strong>
      </p>
      <p className="disclaimer">
        An independent teardown by Genmars Tech Limited, written from building
        a point-of-sale against the Daraja API. Not affiliated with, endorsed
        by or connected to Safaricom. Everything below is simulated in your
        browser on a timer — no request leaves this page, and no credential
        exists in this project.
      </p>
    </header>
  );
}

function ScenarioCard({
  scenario,
  active,
  onPick,
}: {
  scenario: Scenario;
  active: boolean;
  onPick: () => void;
}) {
  // Computed, never hand-labelled: the badge is derived from running the
  // scenario to its end, so it cannot drift from what the timeline does.
  const diverges = useMemo(() => {
    const end = frameAt(scenario, runLength(scenario));
    return end.belief.callback !== end.belief.query;
  }, [scenario]);

  return (
    <button
      type="button"
      className="scenario"
      aria-pressed={active}
      onClick={onPick}
    >
      <span className="scenarioTitle">{scenario.title}</span>
      <span className="scenarioBlurb">{scenario.blurb}</span>
      {diverges && <span className="diverges">They disagree</span>}
    </button>
  );
}

function Transport({
  t,
  length,
  playing,
  rate,
  onPlay,
  onScrub,
  onRate,
  onReplay,
  over,
}: {
  t: number;
  length: number;
  playing: boolean;
  rate: number;
  onPlay: () => void;
  onScrub: (v: number) => void;
  onRate: (r: number) => void;
  onReplay: () => void;
  over: boolean;
}) {
  return (
    <div className="transport">
      <button type="button" className="play" onClick={onPlay}>
        {over ? "Replay" : playing ? "Pause" : "Play"}
      </button>
      <span className="clock" aria-live="off">
        {fmt(t)}
      </span>
      <input
        className="scrub"
        type="range"
        min={0}
        max={length}
        step={0.1}
        value={t}
        onChange={(e) => onScrub(Number(e.target.value))}
        aria-label="Scrub the timeline"
      />
      <div className="speeds" role="group" aria-label="Playback speed">
        {[1, 4, 10].map((r) => (
          <button
            key={r}
            type="button"
            className="speed"
            aria-pressed={rate === r}
            onClick={() => onRate(r)}
          >
            {r}&times;
          </button>
        ))}
      </div>
      <button type="button" className="ghost" onClick={onReplay}>
        Restart
      </button>
    </div>
  );
}

function Till({
  strategy,
  belief,
  truth,
  detail,
}: {
  strategy: Strategy;
  belief: Belief;
  truth: string;
  detail: string;
}) {
  // "Wrong" means the till is confidently asserting something untrue. A till
  // still waiting is not wrong, it is waiting — and marking it so would make
  // the warning meaningless on the scenarios where it matters.
  const confident = belief === "paid" || belief === "failed" || belief === "expired";
  const wrong = confident && belief !== truth;

  return (
    <article className={`till${wrong ? " tillWrong" : ""}`}>
      <div className="tillHead">
        <span className="tillName">{HOW[strategy].name}</span>
        <span className="tillHow">{HOW[strategy].how}</span>
      </div>
      <div className="screen">
        <div className={`screenState s-${belief}`}>{STATE_WORDS[belief]}</div>
        <div className="screenLine">{detail}</div>
      </div>
      {wrong && (
        <span className="pill p-failed">
          {belief === "paid" ? "Believes money arrived" : "Believes it failed"}
        </span>
      )}
    </article>
  );
}

function callbackDetail(belief: Belief, seen: WireEvent[]): string {
  const forged = seen.some((e) => e.callback?.forged);
  if (belief === "waiting") return "No callback has arrived.";
  if (belief === "unknown") return "No callback ever arrived. Nothing else to go on.";
  if (forged && belief === "paid")
    return "Acting on a POST from an unknown host. Nothing in the body proved who sent it.";
  return "Acting on the last callback received.";
}

function queryDetail(belief: Belief, polls: { at: number; answer: string }[]): string {
  const n = polls.length;
  const plural = n === 1 ? "query" : "queries";
  if (belief === "waiting")
    return `${n} ${plural} so far — Safaricom still says it is being processed.`;
  if (belief === "unknown")
    return `${n} ${plural}, still being processed when the cashier ran out of time.`;
  return `Confirmed by Safaricom on query ${n}.`;
}

function Wire({ scenario, frame }: { scenario: Scenario; frame: ReturnType<typeof frameAt> }) {
  const pollsSoFar = frame.polls.length;

  return (
    <div className="wire">
      <div className="wireHead">
        <span className="wireTitle">The wire</span>
        <span className="wireHint">
          Payload shapes as a developer meets them, trimmed
        </span>
      </div>
      <div className="wireBody">
        {frame.seen.length === 0 ? (
          <p className="empty">Nothing on the wire yet. Press play.</p>
        ) : (
          frame.seen.map((e, i) => (
            <div className="event" key={`${scenario.slug}-${i}`}>
              <span className="eventAt">{fmt(e.at)}</span>
              <div className="eventMain">
                <div className="eventLabel">
                  <span className={e.callback?.forged ? "forged" : undefined}>
                    {e.label}
                  </span>
                  <span className="hop">{hop(e)}</span>
                </div>
                {e.note && <p className="eventNote">{e.note}</p>}
                {e.payload && (
                  <pre className="payload">{JSON.stringify(e.payload, null, 2)}</pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <p className="polls">
        Till B has asked <code>stkpushquery</code> {pollsSoFar}{" "}
        {pollsSoFar === 1 ? "time" : "times"}. Till A has asked nothing — it is
        waiting to be told.
      </p>
    </div>
  );
}

function Reference() {
  return (
    <section className="section" aria-labelledby="codes">
      <div className="sectionHead">
        <p className="eyebrow">Reference</p>
        <h2 id="codes">Result codes a till actually sees</h2>
        <p>
          Not the full catalogue — the handful that account for almost every
          push, plus the one that is routinely misread.
        </p>
      </div>
      <div className="tableWrap">
        <table className="codes">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {RESULT_CODES.map((c) => (
              <tr key={c.code}>
                <td>{c.code}</td>
                <td>
                  {c.meaning}
                  {c.note && <span className="codeNote">{c.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="close">
      <p className="eyebrow">What this came out of</p>
      <p>
        Genmars builds point-of-sale and payment integrations for Kenyan
        businesses. This is the part of that work that took longest to get
        right, written down because Daraja&rsquo;s own documentation does not
        cover it and every integration meets the same five situations.
      </p>
      <p>
        The rule the code ended up with is one line:{" "}
        <strong>a callback never decides anything.</strong> It records that
        something happened and prompts us to ask Safaricom directly, and only
        Safaricom&rsquo;s own answer moves a payment to paid. A forged callback
        therefore costs one outbound query and achieves nothing — and the till
        keeps working on the days the callback never arrives at all.
      </p>
      <p>
        <a href="https://genmars.co.ke/services" rel="noopener">
          genmars.co.ke
        </a>
      </p>
      <p className="colophon">
        Simulated entirely in the browser; no network request is made and no
        credential exists in this repository. Not affiliated with Safaricom.
        M-PESA and Daraja are trademarks of their respective owners, used here
        only to identify the API being described. Set in Fraunces, IBM Plex
        Sans and Jost.
      </p>
    </section>
  );
}
