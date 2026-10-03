import { useCallback, useEffect, useRef, useState } from "react";

import { type Result } from "./exec";
import { type FromWorker, type Schema, type ToWorker } from "./protocol";

export type Failure = { message: string; at: number | null; length: number };

export type EngineState = {
  loading: boolean;
  running: boolean;
  table: { name: string; rows: number; bytes: number; sourceBytes: number; ms: number } | null;
  schema: Schema;
  result: Result | null;
  failure: Failure | null;
};

const IDLE: EngineState = {
  loading: true,
  running: false,
  table: null,
  schema: [],
  result: null,
  failure: null,
};

export const useEngine = () => {
  const [state, setState] = useState<EngineState>(IDLE);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("./engine.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data;
      setState((prev) => {
        switch (message.type) {
          case "loaded":
            return {
              ...prev,
              loading: false,
              table: {
                name: message.name,
                rows: message.rows,
                bytes: message.bytes,
                sourceBytes: message.sourceBytes,
                ms: message.ms,
              },
              schema: message.schema,
              result: null,
              failure: null,
            };
          case "result":
            return { ...prev, running: false, result: message.result, failure: null };
          case "failed":
            return {
              ...prev,
              loading: false,
              running: false,
              failure: { message: message.message, at: message.at, length: message.length },
            };
        }
      });
    };

    workerRef.current = worker;
    const first: ToWorker = { type: "sample", rows: 60_000 };
    worker.postMessage(first);

    return () => worker.terminate();
  }, []);

  const query = useCallback((sql: string) => {
    setState((prev) => ({ ...prev, running: true, failure: null }));
    const message: ToWorker = { type: "query", sql };
    workerRef.current?.postMessage(message);
  }, []);

  const loadCsv = useCallback((name: string, csv: string) => {
    setState((prev) => ({ ...prev, loading: true, result: null, failure: null }));
    const message: ToWorker = { type: "load", name, csv };
    workerRef.current?.postMessage(message);
  }, []);

  const loadSample = useCallback((rows: number) => {
    setState((prev) => ({ ...prev, loading: true, result: null, failure: null }));
    const message: ToWorker = { type: "sample", rows };
    workerRef.current?.postMessage(message);
  }, []);

  return { ...state, query, loadCsv, loadSample };
};
