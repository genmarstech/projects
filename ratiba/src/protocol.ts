/**
 * What crosses the worker boundary.
 *
 * Declared in its own module so the two sides cannot drift: the worker
 * imports it to type what it posts, the hook imports it to type what it
 * receives, and a message shape that changes on one side stops compiling
 * on the other. A `postMessage` boundary is otherwise the one place in a
 * TypeScript application where `any` gets in without anybody choosing it.
 */

import { type Rules } from "./model";
import { type Impossibility, type Load, type Outcome, type Progress } from "./solver";

export type ToWorker =
  | { type: "solve"; presetId: string; rules: Rules; improveRounds: number }
  | { type: "cancel" };

export type FromWorker =
  | { type: "precheck"; reasons: Impossibility[] }
  | { type: "progress"; progress: Progress }
  | { type: "done"; outcome: Outcome; loads: Record<string, Load>; elapsed: number; swaps: number }
  | { type: "cancelled"; nodes: number };
