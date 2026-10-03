/**
 * The table lives here, not on the main thread.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE COLUMN STORE IS NEVER POSTED BACK, AND THAT IS THE DESIGN.
 *
 * `postMessage` copies. Sending a sixty-thousand-row table to the page so
 * the page can query it would serialise several megabytes on every load,
 * and then every query would run on the thread that is trying to paint.
 *
 * So the data goes in once and never comes out. What crosses the boundary
 * afterwards is a statement in and at most a few hundred result rows back.
 * The page holds a schema and a result; the worker holds the table.
 *
 * ⚠ THIS IS ALSO WHY PARSING HAPPENS HERE. A 4 MB CSV string posted to the
 *   worker is one copy; the same string parsed on the main thread and the
 *   resulting arrays posted over is a frozen tab and then a second copy.
 */

import { type Table, buildTable, describe } from "./columnar";
import { parseCsv } from "./csv";
import { run } from "./exec";
import { sampleCsv } from "./dataset";
import { type FromWorker, type ToWorker } from "./protocol";
import { SqlError } from "./sql";

let table: Table | null = null;

const post = (message: FromWorker) => self.postMessage(message);

const load = (name: string, csv: string) => {
  const started = performance.now();
  table = buildTable(name, parseCsv(csv));
  post({
    type: "loaded",
    name: table.name,
    rows: table.rows,
    bytes: table.bytes,
    schema: describe(table),
    ms: performance.now() - started,
    sourceBytes: csv.length,
  });
};

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data;

  try {
    if (message.type === "sample") {
      load("sales", sampleCsv(message.rows));
      return;
    }

    if (message.type === "load") {
      load(message.name, message.csv);
      return;
    }

    if (!table) {
      post({ type: "failed", message: "No table is loaded.", at: null, length: 0 });
      return;
    }

    post({ type: "result", result: run(message.sql, table) });
  } catch (error) {
    // A SqlError carries where it happened, and the editor underlines it.
    // Anything else is a bug in this engine and says so plainly rather than
    // being dressed up as a syntax error the reader could have avoided.
    if (error instanceof SqlError) {
      post({ type: "failed", message: error.message, at: error.at, length: error.length });
    } else {
      post({
        type: "failed",
        message: error instanceof Error ? error.message : String(error),
        at: null,
        length: 0,
      });
    }
  }
};
