import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Chart } from "./Chart";
import { chartable } from "./chart";
import { fmt } from "./columnar";
import { EXAMPLES, SAMPLE_ROWS } from "./dataset";
import { useEngine } from "./useEngine";

const bytes = (n: number) =>
  n > 1_048_576 ? `${(n / 1_048_576).toFixed(2)} MB` : `${Math.round(n / 1024)} kB`;

export const App = () => {
  const engine = useEngine();
  const { query, table } = engine;
  const [sql, setSql] = useState(EXAMPLES[0].sql);
  const [note, setNote] = useState(EXAMPLES[0].note);
  const [dropping, setDropping] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /*
   * Run whatever is in the editor as soon as a table arrives, so the page
   * is never a form waiting to be filled in before it shows what it does.
   *
   * ⚠ KEYED ON THE TABLE, NOT ON THE STATEMENT, AND THAT IS NOT AN
   *   OVERSIGHT. Adding `sql` to this list would run a query over sixty
   *   thousand rows on every keystroke. Typing is explicitly not a
   *   trigger; Run and ⌘-Enter are.
   */
  const sqlRef = useRef(sql);
  sqlRef.current = sql;
  useEffect(() => {
    if (table) query(sqlRef.current);
  }, [table, query]);

  const take = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        engine.loadCsv(file.name.replace(/\.csv$/i, "").replace(/\W+/g, "_") || "data", text);
      };
      reader.readAsText(file);
    },
    [engine],
  );

  const result = engine.result;
  const pick = useMemo(
    () => (result ? chartable(result.columns, result.rows) : null),
    [result],
  );

  // The caret line under the statement, built from the offset the parser
  // carried all the way out of the worker.
  const caret = useMemo(() => {
    const f = engine.failure;
    if (!f || f.at === null) return null;
    const before = sql.slice(0, f.at);
    const line = before.split("\n").length - 1;
    const col = f.at - (before.lastIndexOf("\n") + 1);
    return { line, col, length: Math.max(1, f.length) };
  }, [engine.failure, sql]);

  return (
    <div
      className={`shell${dropping ? " is-dropping" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropping(false);
        const file = e.dataTransfer.files[0];
        if (file) take(file);
      }}
    >
      <header className="masthead">
        <div className="masthead__brand">
          <span className="wordmark">Mizani</span>
          <span className="masthead__rule" aria-hidden="true" />
          <span className="masthead__sub">a column store and a query engine, in the tab</span>
        </div>
        <p className="notice">
          A Genmars Tech demonstration. The sample is{" "}
          {fmt(SAMPLE_ROWS)} invented till lines, generated in your browser
          from a seed — not anybody&rsquo;s takings. Drop a CSV of your own
          anywhere on this page and it is read in the same tab: nothing is
          uploaded, and there is no server to upload it to.
        </p>
      </header>

      <section className="source">
        <dl className="meter">
          <div>
            <dt>Table</dt>
            <dd>{engine.table ? engine.table.name : "loading"}</dd>
          </div>
          <div>
            <dt>Rows</dt>
            <dd>{engine.table ? fmt(engine.table.rows) : "—"}</dd>
          </div>
          <div>
            <dt>CSV</dt>
            <dd>{engine.table ? bytes(engine.table.sourceBytes) : "—"}</dd>
          </div>
          <div>
            <dt>Column store</dt>
            <dd>{engine.table ? bytes(engine.table.bytes) : "—"}</dd>
          </div>
          <div>
            <dt>Parsed in</dt>
            <dd>{engine.table ? `${engine.table.ms.toFixed(0)} ms` : "—"}</dd>
          </div>
        </dl>

        <div className="source__actions">
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Open a CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="visually-hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) take(file);
            }}
          />
          <button type="button" className="btn" onClick={() => engine.loadSample(SAMPLE_ROWS)}>
            Reload the sample
          </button>
          <button type="button" className="btn" onClick={() => engine.loadSample(400_000)}>
            Make it 400,000 rows
          </button>
        </div>
      </section>

      <section className="schema" aria-label="Columns">
        <table>
          <thead>
            <tr>
              <th scope="col">Column</th>
              <th scope="col">Stored as</th>
              <th scope="col" className="num">Distinct</th>
              <th scope="col">Values</th>
            </tr>
          </thead>
          <tbody>
            {engine.schema.map((c) => (
              <tr key={c.name}>
                <td className="mono">{c.name}</td>
                <td>
                  <span className={`kind kind--${c.kind}`}>
                    {c.kind === "dict" ? "dictionary + Int32Array" : "Float64Array"}
                  </span>
                </td>
                <td className="num">{c.distinct === null ? "—" : fmt(c.distinct)}</td>
                <td className="muted">{c.sample}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="editor">
        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              className={`btn btn--chip${sql === ex.sql ? " is-on" : ""}`}
              onClick={() => {
                setSql(ex.sql);
                setNote(ex.note);
                query(ex.sql);
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <label className="visually-hidden" htmlFor="sql">
          The statement
        </label>
        <textarea
          id="sql"
          className="sql"
          spellCheck={false}
          rows={6}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              query(sql);
            }
          }}
        />

        <div className="editor__bar">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => query(sql)}
            disabled={engine.loading}
          >
            Run
          </button>
          <span className="hint">⌘/Ctrl + Enter</span>
          <span className="note">{note}</span>
        </div>

        {engine.failure && (
          <div className="failure" role="alert">
            {caret && (
              /*
                The caret is the reason the parser carries an offset through
                three modules and a worker boundary. "Syntax error" tells a
                reader their query is wrong; a mark under the word tells
                them which word.
              */
              <pre className="failure__caret">
                {sql.split("\n")[caret.line]}
                {"\n"}
                {" ".repeat(caret.col)}
                {"^".repeat(caret.length)}
              </pre>
            )}
            <p>{engine.failure.message}</p>
          </div>
        )}
      </section>

      {result && !engine.failure && (
        <>
          <section className="plan" aria-labelledby="plan-heading">
            <h2 id="plan-heading">
              How it ran
              <span className="plan__total">{result.ms.toFixed(1)} ms</span>
            </h2>
            <ol>
              {result.plan.map((step, i) => (
                <li key={`${step.label}-${i}`}>
                  <span className="plan__label">{step.label}</span>
                  <span className="plan__detail">{step.detail}</span>
                  {step.ms !== undefined && (
                    <span className="plan__ms">{step.ms.toFixed(1)} ms</span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {pick && <Chart columns={result.columns} rows={result.rows} pick={pick} />}

          <section className="results" aria-label="Result">
            <div className="results__head">
              <h2>
                {fmt(result.total)} row{result.total === 1 ? "" : "s"}
              </h2>
              {result.rows.length < result.total && (
                <span className="muted">showing the first {fmt(result.rows.length)}</span>
              )}
            </div>
            <div className="results__scroll">
              <table>
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className={typeof cell === "number" ? "num" : undefined}>
                          {cell === null ? <span className="muted">—</span> : typeof cell === "number" ? fmt(cell) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {result.rows.length === 0 && (
                    <tr>
                      <td colSpan={Math.max(1, result.columns.length)} className="muted">
                        Nothing matched.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="foot">
        <p>
          Stored down the columns, not across the rows. A text column is a
          dictionary and an <code>Int32Array</code> of codes, so{" "}
          <code>branch = &lsquo;Nakuru&rsquo;</code> resolves the literal to
          one integer before the scan and then compares integers — and if
          the literal is not in the dictionary at all, the predicate is false
          for every row and there is nothing to scan.
        </p>
        <p>
          The table lives in a Web Worker and is never posted back.{" "}
          <code>postMessage</code> copies, so sending it to the page would
          serialise megabytes on every load and then run every query on the
          thread trying to paint. A statement goes in and a few hundred rows
          come out.
        </p>
        <p className="foot__meta">
          No SQL parser, no dataframe library, no charting library. Six
          hundred lines of TypeScript and React.
        </p>
      </footer>

      {dropping && <div className="drop" aria-hidden="true">Drop the CSV</div>}
    </div>
  );
};
