/**
 * The search, off the main thread, in chunks it can be interrupted between.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE `setTimeout` IS THE WHOLE REASON THIS WORKER IS CANCELLABLE.
 *
 * A worker running a recursive backtracker is not reading its message
 * queue. `postMessage({type: "cancel"})` from the page sits in that queue
 * until the search returns, which is exactly the moment cancelling stops
 * being useful.
 *
 * So the search runs `CHUNK` nodes at a time and yields to the event loop
 * between chunks. The queue drains, `cancelled` is seen, and the loop
 * stops. The same yield is what lets progress be posted while the search is
 * still running rather than as one message at the end.
 *
 * ⚠ DO NOT REPLACE THE `setTimeout` WITH A TIGHT `while`. It will be faster
 *   by a few per cent and the Cancel button will stop working, and nothing
 *   will fail — the button will simply do nothing until the answer arrives.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { PRESETS } from "./data";
import { problemFor } from "./build";
import { type FromWorker, type ToWorker } from "./protocol";
import { Solver, precheck } from "./solver";

/** Nodes between yields. Small enough that a cancel lands inside a frame. */
const CHUNK = 1500;

let cancelled = false;

const post = (message: FromWorker) => self.postMessage(message);

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data;

  if (message.type === "cancel") {
    cancelled = true;
    return;
  }

  cancelled = false;

  const preset = PRESETS.find((p) => p.id === message.presetId);
  if (!preset) return;

  const problem = problemFor(preset, message.rules);

  // The counting arguments first. They cost microseconds and they are the
  // only place a useful sentence can be produced before any search happens.
  post({ type: "precheck", reasons: precheck(problem) });

  const solver = new Solver(problem);
  const started = performance.now();

  const run = () => {
    if (cancelled) {
      post({ type: "cancelled", nodes: solver.progress.nodes });
      return;
    }

    const outcome = solver.step(CHUNK);

    if (!outcome) {
      post({ type: "progress", progress: solver.progress });
      setTimeout(run, 0);
      return;
    }

    // Hill-climbing is bounded and fast enough not to need chunking; it
    // runs a fixed number of swaps over a rota that is already legal.
    const swaps = outcome.status === "solved" ? solver.improve(message.improveRounds) : 0;

    post({
      type: "done",
      outcome: solver.outcome ?? outcome,
      loads: solver.loadsSnapshot(),
      elapsed: performance.now() - started,
      swaps,
    });
  };

  run();
};
