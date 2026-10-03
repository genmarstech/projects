/**
 * What crosses the worker boundary, declared once so the two sides cannot
 * drift. A `postMessage` is otherwise the one place in a TypeScript
 * application where `any` gets in without anybody choosing it.
 */

import { type Result } from "./exec";

export type Schema = {
  name: string;
  kind: "number" | "dict";
  distinct: number | null;
  sample: string;
}[];

export type ToWorker =
  | { type: "sample"; rows: number }
  | { type: "load"; name: string; csv: string }
  | { type: "query"; sql: string };

export type FromWorker =
  | { type: "loaded"; name: string; rows: number; bytes: number; schema: Schema; ms: number; sourceBytes: number }
  | { type: "result"; result: Result }
  | { type: "failed"; message: string; at: number | null; length: number };
