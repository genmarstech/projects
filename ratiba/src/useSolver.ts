import { useCallback, useEffect, useRef, useState } from "react";

import { type Rules } from "./model";
import { type FromWorker, type ToWorker } from "./protocol";
import { type Impossibility, type Load, type Outcome, type Progress } from "./solver";

export type SolveState = {
  running: boolean;
  progress: Progress | null;
  precheck: Impossibility[];
  outcome: Outcome | null;
  loads: Record<string, Load>;
  elapsed: number;
  swaps: number;
};

const IDLE: SolveState = {
  running: false,
  progress: null,
  precheck: [],
  outcome: null,
  loads: {},
  elapsed: 0,
  swaps: 0,
};

export const useSolver = () => {
  const [state, setState] = useState<SolveState>(IDLE);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // `new URL(..., import.meta.url)` is what lets the bundler see the
    // worker as a module graph of its own rather than as a string it cannot
    // follow. A literal path here works in dev and ships a 404 in
    // production, which is the worst of the two failure modes.
    const worker = new Worker(new URL("./solver.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data;
      setState((prev) => {
        switch (message.type) {
          case "precheck":
            return { ...prev, precheck: message.reasons };
          case "progress":
            return { ...prev, progress: message.progress };
          case "done":
            return {
              ...prev,
              running: false,
              outcome: message.outcome,
              loads: message.loads,
              elapsed: message.elapsed,
              swaps: message.swaps,
              progress: { ...(prev.progress ?? { nodes: 0, depth: 0, filled: 0, total: 0, phase: "done" as const }), phase: "done" as const },
            };
          case "cancelled":
            return { ...prev, running: false };
        }
      });
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const solve = useCallback((presetId: string, rules: Rules, improveRounds = 60_000) => {
    setState({ ...IDLE, running: true });
    const message: ToWorker = { type: "solve", presetId, rules, improveRounds };
    workerRef.current?.postMessage(message);
  }, []);

  const cancel = useCallback(() => {
    const message: ToWorker = { type: "cancel" };
    workerRef.current?.postMessage(message);
  }, []);

  return { ...state, solve, cancel };
};
