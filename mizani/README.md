# Mizani — a column store and a query engine in the tab

Sixty thousand till lines, a dictionary-encoded column store, a hand-written
SQL subset, and a query plan that says which columns it read and how many
bytes it touched. Drop a CSV of your own on the page and it is read in the
same tab — nothing is uploaded, and there is no server to upload it to.

A Genmars Tech demonstration. The sample data is invented and generated in
the browser from a seed.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

No SQL parser, no dataframe library, no charting library. About six hundred
lines of TypeScript.

---

## Down the columns, not across the rows

Sixty thousand rows as `{branch, category, qty, …}` objects is sixty
thousand allocations, each with its own property map, and `"Nakuru"` is
stored once per row that mentions Nakuru. `SUM(total) WHERE branch =
'Nakuru'` over that walks the whole heap and touches every field of every
object to read two of them.

Stored down the columns, the same query reads two contiguous typed arrays
and does not touch the other eight at all. 4.5 MB of CSV becomes a 3.0 MB
column store, and the plan reports what each query actually read:

```
Columns  2 of 10 read — 703 kB of 3,051 kB
Scan     sales, all 60,000 rows, no filter
Group    10 groups on branch · integer keys from dictionary codes   9.6 ms
Sort     takings desc                                                0.2 ms
```

### The dictionary is what makes it fast, not just small

A text column is a `string[]` dictionary and an `Int32Array` of codes. So
`branch = 'Nakuru'` does not compare strings sixty thousand times: the
literal is looked up **once, before the scan**, and the predicate becomes
integer equality against the code array.

And if the literal is not in the dictionary at all, the predicate is false
for every row in the table — so there is nothing to scan. Try the *filter
that matches nothing* example:

```
Columns  3 of 10 referenced, 0 kB read
Prune    “Kitale” never appears in branch — the predicate is false for
         every row, so the column is not read
```

A spelling mistake in a filter returns in two tenths of a millisecond
instead of reading a column.

The same trick makes `GROUP BY` cheap rather than merely compact: grouping
on dictionary columns needs an array indexed by an integer key built from
the codes. No hash map, no string keys. The moment a group column is
numeric the cardinality is unbounded and it has to be a `Map` — both are
implemented, because both occur, and **the plan says which one ran**.
Reporting "grouped" without saying how hides the single biggest difference
in how long a query took.

---

## Three decisions worth the space

### `split(",")` is not a CSV reader

Four things it gets wrong, in the order they bite: a comma inside a quoted
field, a doubled quote inside a quoted field, a newline inside a quoted
field, and a trailing CR from a file written on Windows.

Every one produces a file that imports *almost* correctly. The row count is
right; the columns are shifted on the eleven rows that happened to contain
a comma; the error surfaces three weeks later as a total that is out by a
few thousand shillings. So `csv.ts` is a state machine over characters —
sixty lines, and RFC 4180.

### Expressions are compiled once, not interpreted per row

The obvious executor walks the syntax tree for every row: switch on the
node kind, recurse, switch again. Over sixty thousand rows and a four-node
predicate that is a quarter of a million switch dispatches, and the engine
cannot specialise any of them because the shape is only known at the moment
it is used.

`compile()` walks the tree once and returns a closure. The switch happens
at compile time; the scan calls a function whose body is already decided.

### Every error carries a character offset

A parser that reports "syntax error" has not finished the job. The offset is
carried from the tokeniser through the parser, out of the worker, and into a
caret under the word:

```
SELECT branch FROM sales WHERE brnch = 'x'
                               ^^^^^
There is no column called “brnch”. Did you mean branch?
```

That is also why the engine parses one statement shape rather than
borrowing a full SQL parser. A full parser would happily accept a join and
then fail at execution with a message about an internal node type, which is
worse than being told at the caret that the word is not understood here.
Charter 03 §I.

The messages explain rather than cite:

> “qty” is neither grouped nor aggregated, so there is no single value for
> it in a group.

---

## The table never leaves the worker

`postMessage` copies. Sending a sixty-thousand-row table to the page so the
page can query it would serialise megabytes on every load, and then every
query would run on the thread that is trying to paint.

So the data goes in once and never comes out. A statement goes in; at most a
few hundred result rows come back. The page holds a schema and a result; the
worker holds the table. That is also why parsing happens in the worker — a
4 MB string posted across is one copy, while parsing on the main thread and
posting the arrays over is a frozen tab *and* a second copy.

## What it supports

```
SELECT  <expr> [AS name], … | *
FROM    <table>
WHERE   comparisons, AND / OR / NOT, IN (…), LIKE '…'
GROUP BY <columns>
ORDER BY <output columns> [DESC]
LIMIT   <n>
```

Aggregates: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. Arithmetic: `+ - * /`.

No joins, no subqueries, no window functions, no `HAVING`. The parser
refuses them at the caret rather than accepting them and failing later.

---

## Layout

```
src/
  main.tsx           mounts App
  App.tsx            source bar, schema, editor, plan, chart, results
  Chart.tsx          the canvas, resize and theme handling
  chart.ts           whether a result is chartable, and the bars
  csv.ts             RFC 4180, as a state machine
  columnar.ts        typed columns, dictionary encoding, the store
  sql.ts             tokeniser and recursive-descent parser
  exec.ts            compilation, the scan, grouping, ordering, the plan
  dataset.ts         the seeded sample, generated as CSV on purpose
  engine.worker.ts   where the table lives
  protocol.ts        the message types, so the two sides cannot drift
  useEngine.ts       worker lifecycle
  styles.css         tokens for both themes, then everything else
```

## Things worth knowing before changing it

**The sample is built as CSV text and handed to the same reader a dropped
file goes through.** Constructing the column store directly would be
faster, and it would mean the demonstration never exercises the parser. A
sample dataset that takes a different code path to the user's own is a
sample dataset that can be green while the real thing is broken.

**The page does not run a query on every keystroke.** The effect that runs
one is keyed on the table, not on the statement, and the statement is read
through a ref. Adding `sql` to that dependency list would query sixty
thousand rows on every character typed.

**Referenced and read are two different counts.** A pruned query references
three columns and reads none, and reporting the first as the second would
contradict the Prune line directly above it — which is a quick way to teach
a reader that the plan is decoration.

**The canvas needs a `ResizeObserver` and a theme listener.** A canvas does
not reflow, so a window resize smears the bars; and it does not re-read the
stylesheet, so a theme change leaves one theme's ink on the other's ground
until something else happens to repaint.

**`Parser` takes its tokens as an ordinary field, not a constructor
parameter property.** The shorthand emits code, so a file using it cannot be
read by a runtime that only strips types — which is how the engine is
exercised outside the browser.

**The result table scrolls inside its own box, both ways.** `SELECT *` on a
wide table is a legitimate thing to type, and the answer is a scrollbar on
that element — never on the page, which would move the masthead sideways.

---

## How it looks, and why it is not the house style

**Greenbar.** The five projects in this repository deliberately do not
share a palette. Each is a demonstration of a different thing and is
dressed as that thing; only `kioo`, which *is* the Genmars design system,
wears the company's colours. A portfolio where every piece looks the same
is a portfolio that shows one piece.

Continuous-form ledger paper, with its alternating bands, and a
printer-ribbon plum for the one colour that is neither paper nor ink. The
banding on the result table is the reference made literal — and also the
reason it existed, because a wide row of figures is easier to track across
when every other one is tinted.

Chivo Mono sets the wordmark, the column names, the statement and the plan;
Chivo sets the prose. One superfamily, two voices: a column name and the
sentence describing it look related rather than merely adjacent.

Both themes are measured rather than eyeballed. `--ink-muted` and
`--ink-faint` are the ink mixed toward the ground until they only just
clear 6:1 and 4.6:1 against the tightest surface they ever sit on, and
`--rule-strong` is the alpha at which a control's border reaches the 3:1
that WCAG 2.2 §1.4.11 asks of it — the comfortable-looking hairline was
about 1.8:1.

---

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`,
with no server-side anything. The worker ships as its own chunk.
Chivo and Chivo Mono are self-hosted in `public/fonts/` under the SIL Open Font
Licence, included alongside them.
