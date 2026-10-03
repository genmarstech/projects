/**
 * The table, stored down the columns instead of across the rows.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * WHY THIS IS NOT AN ARRAY OF OBJECTS
 *
 * Fifty thousand rows as `{branch, category, qty, …}` objects is fifty
 * thousand allocations, each with its own hidden class and its own property
 * map, and the strings inside them are repeated: "Nakuru" stored once per
 * row that mentions Nakuru.
 *
 * `SUM(total) WHERE branch = 'Nakuru'` over that walks the whole heap and
 * touches every field of every object to read two of them.
 *
 * Down the columns, the same query reads two contiguous typed arrays and
 * skips the rest of the table entirely. The branch column is a `Int32Array`
 * of dictionary codes, so the comparison is integer equality — the literal
 * is mapped to its code once, before the scan, rather than a string
 * comparison fifty thousand times.
 *
 * ⚠ THE DICTIONARY IS WHAT MAKES GROUP BY CHEAP, NOT JUST SMALL.
 *
 *   Grouping on a dictionary column needs an array of the dictionary's
 *   length, indexed by code. No hash map, no string keys, no iteration
 *   order to worry about. Grouping on a free-text column cannot do that and
 *   falls back to a Map, which is why `kind` is checked rather than assumed.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type Column =
  | {
      kind: "number";
      name: string;
      values: Float64Array;
    }
  | {
      kind: "dict";
      name: string;
      /** Index into `dict`. -1 is null. */
      codes: Int32Array;
      dict: string[];
      /** Built lazily: the reverse lookup a WHERE clause needs. */
      index: Map<string, number>;
    };

export type Table = {
  name: string;
  rows: number;
  columns: Column[];
  byName: Map<string, Column>;
  /** Bytes the column store occupies. Printed, because the point is size. */
  bytes: number;
};

/** A column is numeric if every non-empty value in it parses as a number. */
const looksNumeric = (values: string[]): boolean => {
  let seen = 0;
  for (const v of values) {
    if (v === "") continue;
    seen += 1;
    if (!Number.isFinite(Number(v))) return false;
    // Ten thousand samples is enough to be sure and cheap enough to always
    // do. A column that turns out to be mixed is caught on the real pass
    // below, where a bad value becomes NaN rather than a thrown error.
    if (seen > 10_000) break;
  }
  return seen > 0;
};

export const buildTable = (name: string, rows: string[][]): Table => {
  if (rows.length === 0) throw new Error("The file has no rows.");

  const header = rows[0].map((h, i) => h.trim() || `column_${i + 1}`);
  const body = rows.slice(1);
  const columns: Column[] = [];
  let bytes = 0;

  for (let c = 0; c < header.length; c += 1) {
    const raw = body.map((r) => (r[c] ?? "").trim());

    if (looksNumeric(raw)) {
      const values = new Float64Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) {
        values[i] = raw[i] === "" ? Number.NaN : Number(raw[i]);
      }
      columns.push({ kind: "number", name: header[c], values });
      bytes += values.byteLength;
      continue;
    }

    const dict: string[] = [];
    const index = new Map<string, number>();
    const codes = new Int32Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      const v = raw[i];
      if (v === "") {
        codes[i] = -1;
        continue;
      }
      let code = index.get(v);
      if (code === undefined) {
        code = dict.length;
        dict.push(v);
        index.set(v, code);
      }
      codes[i] = code;
    }
    columns.push({ kind: "dict", name: header[c], codes, dict, index });
    bytes += codes.byteLength + dict.reduce((n, s) => n + s.length * 2, 0);
  }

  return {
    name,
    rows: body.length,
    columns,
    byName: new Map(columns.map((col) => [col.name.toLowerCase(), col])),
    bytes,
  };
};

export const describe = (table: Table) =>
  table.columns.map((c) => ({
    name: c.name,
    kind: c.kind,
    distinct: c.kind === "dict" ? c.dict.length : null,
    sample:
      c.kind === "dict"
        ? c.dict.slice(0, 4).join(", ")
        : `${fmt(min(c.values))} … ${fmt(max(c.values))}`,
  }));

const min = (v: Float64Array) => {
  let m = Infinity;
  for (let i = 0; i < v.length; i += 1) if (v[i] < m) m = v[i];
  return m;
};
const max = (v: Float64Array) => {
  let m = -Infinity;
  for (let i = 0; i < v.length; i += 1) if (v[i] > m) m = v[i];
  return m;
};

export const fmt = (n: number): string => {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
