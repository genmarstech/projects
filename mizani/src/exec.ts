/**
 * Planning and running one statement over the column store.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EXPRESSIONS ARE COMPILED ONCE, NOT INTERPRETED PER ROW.
 *
 * The obvious executor walks the syntax tree for every row: switch on the
 * node kind, recurse, switch again. Over fifty thousand rows and a
 * four-node predicate that is two hundred thousand switch dispatches, and
 * the engine cannot specialise any of them because the shape is only known
 * at the moment it is used.
 *
 * `compile` walks the tree once and returns a closure. The switch happens
 * at compile time; the scan calls a function whose body is already decided.
 * Same answer, and the shape of the work is something a JIT can see.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── THE DICTIONARY SPECIALISATION, WHICH IS THE WHOLE POINT OF THE STORE ──
 *
 * `branch = 'Nakuru'` against a dictionary column does not compare strings.
 * The literal is looked up in the dictionary once, before the scan, and the
 * predicate becomes integer equality against the code array.
 *
 * ⚠ AND IF THE LITERAL IS NOT IN THE DICTIONARY AT ALL, THERE IS NOTHING TO
 *   SCAN. The predicate is constant-false over every row in the table, so
 *   the scan is skipped and the plan says so. A spelling mistake in a
 *   filter returns in microseconds instead of reading the column.
 */

import { type Column, type Table, fmt } from "./columnar";
import {
  type Agg,
  type Expr,
  type Query,
  SqlError,
  hasAggregate,
  parse,
} from "./sql";

export type Cell = string | number | null;

export type PlanStep = {
  label: string;
  detail: string;
  /** Milliseconds, where the step is a real phase. */
  ms?: number;
};

export type Result = {
  columns: string[];
  rows: Cell[][];
  /** Rows the result would have had without LIMIT. */
  total: number;
  plan: PlanStep[];
  ms: number;
  scanned: number;
  matched: number;
  bytesRead: number;
};

type Fn = (row: number) => Cell;

// ── Compilation ──────────────────────────────────────────────────────────

const column = (table: Table, name: string, at: number): Column => {
  const col = table.byName.get(name.toLowerCase());
  if (!col) {
    const near = [...table.byName.values()]
      .map((c) => c.name)
      .filter((n) => n.toLowerCase().startsWith(name.toLowerCase().slice(0, 2)))
      .slice(0, 3);
    throw new SqlError(
      `There is no column called “${name}”.${near.length ? ` Did you mean ${near.join(", ")}?` : ""}`,
      at,
      name.length,
    );
  }
  return col;
};

const readCell = (col: Column): Fn =>
  col.kind === "number"
    ? (row) => (Number.isNaN(col.values[row]) ? null : col.values[row])
    : (row) => (col.codes[row] < 0 ? null : col.dict[col.codes[row]]);

const likeToRegExp = (pattern: string): RegExp => {
  // `%` and `_` are the wildcards; everything else is literal, including
  // the characters that are regular-expression operators. Escaping first
  // and substituting after is the order that gets that right.
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/%/g, ".*").replace(/_/g, ".")}$`, "i");
};

type Compiled = { fn: Fn; notes: string[]; constantFalse: boolean };

export const compile = (expr: Expr, table: Table, touched: Set<string>): Compiled => {
  const notes: string[] = [];
  let constantFalse = false;

  const walk = (e: Expr): Fn => {
    switch (e.t) {
      case "num":
        return () => e.value;
      case "str":
        return () => e.value;
      case "col": {
        const col = column(table, e.name, e.at);
        touched.add(col.name);
        return readCell(col);
      }
      case "neg": {
        const inner = walk(e.expr);
        return (row) => -(Number(inner(row)) || 0);
      }
      case "not": {
        const inner = walk(e.expr);
        return (row) => (truthy(inner(row)) ? 0 : 1);
      }
      case "like": {
        const inner = walk(e.left);
        const re = likeToRegExp(e.pattern);
        return (row) => {
          const v = inner(row);
          return v !== null && re.test(String(v)) ? 1 : 0;
        };
      }
      case "in": {
        if (e.left.t === "col") {
          const col = column(table, e.left.name, e.left.at);
          touched.add(col.name);
          if (col.kind === "dict") {
            const codes = new Set<number>();
            for (const v of e.values) {
              const code = col.index.get(String(v));
              if (code !== undefined) codes.add(code);
            }
            if (codes.size === 0) {
              constantFalse = true;
              notes.push(`none of the ${e.values.length} values in the IN list occur in ${col.name}`);
              return () => 0;
            }
            if (codes.size < e.values.length) {
              notes.push(`${e.values.length - codes.size} of the IN values never occur in ${col.name}`);
            }
            notes.push(`IN on ${col.name} became a set of ${codes.size} dictionary codes`);
            return (row) => (codes.has(col.codes[row]) ? 1 : 0);
          }
        }
        const inner = walk(e.left);
        const set = new Set(e.values.map(String));
        return (row) => (set.has(String(inner(row))) ? 1 : 0);
      }
      case "agg":
        // Aggregates are lifted out before compilation; reaching one here
        // means it was written somewhere an aggregate cannot be evaluated.
        throw new SqlError(
          `${e.fn.toUpperCase()}() cannot be used in WHERE. Aggregate after grouping, not before.`,
          e.at,
          e.fn.length,
        );
      case "bin": {
        if (e.op === "and" || e.op === "or") {
          const l = walk(e.left);
          const r = walk(e.right);
          return e.op === "and"
            ? (row) => (truthy(l(row)) && truthy(r(row)) ? 1 : 0)
            : (row) => (truthy(l(row)) || truthy(r(row)) ? 1 : 0);
        }

        // The specialisation. See the banner.
        if ((e.op === "=" || e.op === "!=") && e.left.t === "col" && e.right.t === "str") {
          const col = column(table, e.left.name, e.left.at);
          touched.add(col.name);
          if (col.kind === "dict") {
            const code = col.index.get(e.right.value);
            if (code === undefined) {
              if (e.op === "=") {
                constantFalse = true;
                notes.push(
                  `“${e.right.value}” never appears in ${col.name} — the predicate is false for every row, so the column is not read`,
                );
                return () => 0;
              }
              notes.push(`“${e.right.value}” never appears in ${col.name}, so != matches everything`);
              return () => 1;
            }
            notes.push(`${col.name} ${e.op} “${e.right.value}” became integer compare against code ${code}`);
            return e.op === "="
              ? (row) => (col.codes[row] === code ? 1 : 0)
              : (row) => (col.codes[row] !== code ? 1 : 0);
          }
        }

        const l = walk(e.left);
        const r = walk(e.right);
        switch (e.op) {
          case "+": return (row) => num(l(row)) + num(r(row));
          case "-": return (row) => num(l(row)) - num(r(row));
          case "*": return (row) => num(l(row)) * num(r(row));
          case "/": return (row) => (num(r(row)) === 0 ? null : num(l(row)) / num(r(row)));
          case "=": return (row) => (eq(l(row), r(row)) ? 1 : 0);
          case "!=": return (row) => (eq(l(row), r(row)) ? 0 : 1);
          case "<": return (row) => (cmp(l(row), r(row)) < 0 ? 1 : 0);
          case "<=": return (row) => (cmp(l(row), r(row)) <= 0 ? 1 : 0);
          case ">": return (row) => (cmp(l(row), r(row)) > 0 ? 1 : 0);
          case ">=": return (row) => (cmp(l(row), r(row)) >= 0 ? 1 : 0);
          default:
            throw new SqlError(`“${e.op}” is not an operator this engine has.`, e.at, e.op.length);
        }
      }
    }
  };

  const fn = walk(expr);
  return { fn, notes, constantFalse };
};

const num = (v: Cell): number => (typeof v === "number" ? v : Number(v));
const truthy = (v: Cell): boolean => v !== null && v !== 0 && v !== "";
const eq = (a: Cell, b: Cell): boolean =>
  typeof a === "number" || typeof b === "number" ? num(a) === num(b) : String(a) === String(b);
const cmp = (a: Cell, b: Cell): number => {
  if (typeof a === "number" || typeof b === "number") return num(a) - num(b);
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
};

// ── Aggregation ──────────────────────────────────────────────────────────

type AggState = { n: number; sum: number; min: number; max: number };

const fresh = (): AggState => ({ n: 0, sum: 0, min: Infinity, max: -Infinity });

const feed = (state: AggState, v: Cell) => {
  if (v === null) return;
  const x = num(v);
  if (Number.isNaN(x)) return;
  state.n += 1;
  state.sum += x;
  if (x < state.min) state.min = x;
  if (x > state.max) state.max = x;
};

const readAgg = (fn: Agg, state: AggState, rows: number): Cell => {
  switch (fn) {
    case "count": return state.n;
    case "sum": return state.n === 0 ? null : state.sum;
    case "avg": return state.n === 0 ? null : state.sum / state.n;
    case "min": return state.n === 0 ? null : state.min;
    case "max": return state.n === 0 ? null : state.max;
    default: return rows;
  }
};

// ── Running it ───────────────────────────────────────────────────────────

export const run = (sql: string, table: Table): Result => {
  const started = performance.now();
  const query: Query = parse(sql);

  if (query.from.toLowerCase() !== table.name.toLowerCase()) {
    throw new SqlError(
      `The only table loaded is “${table.name}”.`,
      query.fromAt,
      query.from.length,
    );
  }

  const plan: PlanStep[] = [];
  const touched = new Set<string>();

  // ── Filter ─────────────────────────────────────────────────────────────
  const filterStart = performance.now();
  let matches: Int32Array;
  let matched = 0;
  let scanned = 0;
  let pruned = false;

  if (!query.where) {
    matches = new Int32Array(table.rows);
    for (let i = 0; i < table.rows; i += 1) matches[i] = i;
    matched = table.rows;
    scanned = table.rows;
    plan.push({ label: "Scan", detail: `${table.name}, all ${fmt(table.rows)} rows, no filter` });
  } else {
    const compiled = compile(query.where, table, touched);
    if (compiled.constantFalse) {
      matches = new Int32Array(0);
      pruned = true;
      plan.push({ label: "Prune", detail: compiled.notes.join("; ") });
    } else {
      const buffer = new Int32Array(table.rows);
      for (let i = 0; i < table.rows; i += 1) {
        if (truthy(compiled.fn(i))) buffer[matched++] = i;
      }
      matches = buffer.subarray(0, matched);
      scanned = table.rows;
      plan.push({
        label: "Filter",
        detail:
          `${fmt(matched)} of ${fmt(table.rows)} rows (${((matched / table.rows) * 100).toFixed(1)}%)` +
          (compiled.notes.length ? ` · ${compiled.notes.join("; ")}` : ""),
        ms: performance.now() - filterStart,
      });
    }
  }

  // ── Projection shape ───────────────────────────────────────────────────
  const items = query.star
    ? table.columns.map((c) => ({ expr: { t: "col", name: c.name, at: 0 } as Expr, alias: c.name }))
    : query.items;

  const aggregating = query.groupBy.length > 0 || items.some((it) => hasAggregate(it.expr));

  let columns: string[];
  let rows: Cell[][];

  if (!aggregating) {
    const projStart = performance.now();
    const fns = items.map((it) => compile(it.expr, table, touched).fn);
    columns = items.map((it) => it.alias);
    rows = [];
    for (let i = 0; i < matches.length; i += 1) {
      const row = matches[i];
      rows.push(fns.map((fn) => fn(row)));
    }
    plan.push({
      label: "Project",
      detail: `${columns.length} column${columns.length === 1 ? "" : "s"}`,
      ms: performance.now() - projStart,
    });
  } else {
    const groupStart = performance.now();
    const groupCols = query.groupBy.map((g) => column(table, g.name, g.at));
    for (const c of groupCols) touched.add(c.name);

    /*
     * Integer keys where the columns allow it.
     *
     * Every group column being a dictionary means the key is arithmetic on
     * small integers, and the group table can be a plain array indexed by
     * it. The moment one of them is numeric — a price, a quantity — the
     * cardinality is unbounded and it has to be a Map with string keys.
     *
     * Both are implemented because both occur, and the plan says which one
     * ran. Reporting "grouped" without saying how hides the single biggest
     * difference in how long the query took.
     */
    const allDict = groupCols.every((c) => c.kind === "dict");
    const space = allDict
      ? groupCols.reduce((n, c) => n * ((c as Extract<Column, { kind: "dict" }>).dict.length + 1), 1)
      : Infinity;
    const arrayKeyed = allDict && space <= 1 << 22;

    const index = new Map<string | number, number>();
    const keys: Cell[][] = [];
    const slots: AggState[][] = [];
    const counts: number[] = [];

    const aggItems: { fn: Agg; arg: Fn | null }[] = [];
    const itemPlan: ({ kind: "group"; at: number } | { kind: "agg"; at: number })[] = [];

    for (const it of items) {
      if (it.expr.t === "agg") {
        const arg = it.expr.arg ? compile(it.expr.arg, table, touched).fn : null;
        itemPlan.push({ kind: "agg", at: aggItems.length });
        aggItems.push({ fn: it.expr.fn, arg });
      } else if (it.expr.t === "col") {
        const name = it.expr.name;
        const found = groupCols.findIndex((c) => c.name.toLowerCase() === name.toLowerCase());
        if (found < 0) {
          // The classic SQL mistake, and the message says why rather than
          // quoting the standard: a group holds many rows and this column
          // has a different value in several of them, so there is nothing
          // for the engine to put in the cell.
          throw new SqlError(
            `“${name}” is neither grouped nor aggregated, so there is no single value for it in a group.`,
            it.expr.at,
            name.length,
          );
        }
        itemPlan.push({ kind: "group", at: found });
      } else {
        throw new SqlError(
          "In a grouped query every selected item must be a group column or an aggregate.",
          0,
        );
      }
    }

    const readers = groupCols.map(readCell);

    for (let i = 0; i < matches.length; i += 1) {
      const row = matches[i];

      let key: string | number;
      if (arrayKeyed) {
        let k = 0;
        for (const c of groupCols) {
          const dc = c as Extract<Column, { kind: "dict" }>;
          k = k * (dc.dict.length + 1) + (dc.codes[row] + 1);
        }
        key = k;
      } else {
        key = readers.map((r) => String(r(row))).join("\u0000");
      }

      let g = index.get(key);
      if (g === undefined) {
        g = keys.length;
        index.set(key, g);
        keys.push(readers.map((r) => r(row)));
        slots.push(aggItems.map(() => fresh()));
        counts.push(0);
      }
      counts[g] += 1;
      for (let a = 0; a < aggItems.length; a += 1) {
        const { fn, arg } = aggItems[a];
        if (fn === "count" && arg === null) slots[g][a].n += 1;
        else if (arg) feed(slots[g][a], arg(row));
      }
    }

    columns = items.map((it) => it.alias);
    rows = keys.map((keyRow, g) =>
      itemPlan.map((p) =>
        p.kind === "group" ? keyRow[p.at] : readAgg(aggItems[p.at].fn, slots[g][p.at], counts[g]),
      ),
    );

    plan.push({
      label: "Group",
      detail:
        `${fmt(keys.length)} group${keys.length === 1 ? "" : "s"} on ${
          groupCols.map((c) => c.name).join(", ") || "the whole result"
        } · ` +
        (groupCols.length === 0
          ? "single bucket"
          : arrayKeyed
            ? "integer keys from dictionary codes"
            : "string keys in a hash map — at least one group column is not a dictionary"),
      ms: performance.now() - groupStart,
    });
  }

  // ── Order and limit ────────────────────────────────────────────────────
  if (query.orderBy.length > 0) {
    const sortStart = performance.now();
    const keys = query.orderBy.map((o) => {
      const at = columns.findIndex((c) => c.toLowerCase() === o.name.toLowerCase());
      if (at < 0) {
        throw new SqlError(
          `“${o.name}” is not one of the columns this query returns. ORDER BY names an output column.`,
          o.at,
          o.name.length,
        );
      }
      return { at, desc: o.desc };
    });

    rows.sort((a, b) => {
      for (const k of keys) {
        const d = cmp(a[k.at], b[k.at]);
        if (d !== 0) return k.desc ? -d : d;
      }
      return 0;
    });
    plan.push({
      label: "Sort",
      detail: query.orderBy.map((o) => `${o.name}${o.desc ? " desc" : ""}`).join(", "),
      ms: performance.now() - sortStart,
    });
  }

  const total = rows.length;
  if (rows.length > query.limit) {
    rows = rows.slice(0, query.limit);
    plan.push({ label: "Limit", detail: `${fmt(query.limit)} of ${fmt(total)}` });
  }

  /*
   * Referenced and read are two different counts, and a pruned query is
   * the case that makes them differ. Reporting the referenced columns as
   * "read" on a query whose scan never happened would contradict the Prune
   * line immediately above it, which is a quick way to teach a reader that
   * the plan is decoration.
   */
  const referenced = table.columns.filter((c) => touched.has(c.name));
  const wouldRead = referenced.reduce(
    (n, c) => n + (c.kind === "number" ? c.values.byteLength : c.codes.byteLength),
    0,
  );
  const bytesRead = pruned ? 0 : wouldRead;

  plan.unshift({
    label: "Columns",
    detail: pruned
      ? `${referenced.length} of ${table.columns.length} referenced, 0 kB read`
      : `${referenced.length} of ${table.columns.length} read — ${fmt(Math.round(bytesRead / 1024))} kB of ${fmt(Math.round(table.bytes / 1024))} kB`,
  });

  return {
    columns,
    rows,
    total,
    plan,
    ms: performance.now() - started,
    scanned,
    matched: query.where ? matched : table.rows,
    bytesRead,
  };
};
