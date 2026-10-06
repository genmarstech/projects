# Ratiba — a duty roster that explains why it cannot be built

Forty-two shifts over seven days at a 24-hour pharmacy, filled from ten
people who have contracts, qualifications, leave and a legal right to rest.
Four weeks to choose from; one of them has no answer, and the interesting
part is what the page says about that.

A Genmars Tech demonstration. The branch and the staff are invented. The
constraints are the real ones.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

---

## Why this is not a spreadsheet

Forty-two decisions over a domain of ten is 10⁴² arrangements before
anything constrains anything. Almost all of them are illegal, and the
illegality is **relational**: whether Achieng can take Tuesday morning
depends on whether she took Monday night, which depends on who else could
have.

A rota built greedily, row by row — which is how a spreadsheet builds one —
paints itself into a corner on Friday, and the person holding the pen
unpicks Monday by hand.

The eleven-hour rest period is what does it. A night runs 21:00 to 07:00,
so the next morning starts with zero hours of rest and the next evening
with seven. One night shift silently removes two of the three options from
the following day, for that person, and the effect chains down the week.

## The three things worth looking at

### 1. The valuable output is the one where it fails

"No solution found" is true and useless. The manager holding the leave book
needs to know **which shift** and **which rule**.

Pick *The week that cannot be rostered* and the page says, before searching
at all:

> Fri needs 3 pharmacists across the day and only 2 are available.

and then, after the search:

> Every rota the search tried left Fri night without a pharmacist.
> — Achieng, already on the morning that day
> — Otieno, already on the evening that day
> — Mwikali, on leave that day

Three mechanisms produce that. Two counting arguments run before the search
— a slot nobody could take under any circumstances, and a day needing more
of a role than exist — and they cost microseconds. They are there **for the
message, not for the speed**: the search finds the same impossibility in
milliseconds and cannot phrase it. The third is the search's own record of
where it kept failing, reported from the deepest point it reached, because
that is where the most of the week was already committed and the list of
refusals is most specific.

### 2. The rules are switches on the page, not fallbacks in the code

A solver that quietly relaxed the rest period to produce an answer would be
making an employment-law decision on behalf of whoever read its output.
Nothing here bends. When no rota exists the page names the rule that stopped
it, and a person decides.

Drop the rest period from 11 hours to 9 on the impossible week and watch
what happens.

### 3. A worker that never yields cannot be cancelled

Moving the search off the main thread keeps the page painting, and that is
usually where the thinking stops. But a worker sitting inside a recursive
backtracking call **is not reading its message queue**. A `cancel` posted to
it is delivered when the search finishes, which is the one moment cancelling
is worthless.

So the search is not recursive. It keeps its own stack, and `step(budget)`
explores a fixed number of nodes and returns. The worker calls it in a
`setTimeout` loop; between chunks the queue drains and the cancel is
actually seen. The same yield is what lets progress be reported while the
search is running instead of as one message at the end.

---

## How the search works

**Backtracking with dynamic minimum-remaining-values ordering.** At every
node the next shift filled is whichever currently has the fewest legal
people. That is the whole reason it finishes: filling the week in calendar
order means discovering on Friday that Monday was wrong, and filling the
tightest shift first means the corner you would have painted yourself into
is the first thing you look at.

Every preset with a rota finds one in **42 to 51 nodes** — fewer than two
per shift, so barely any backtracking at all. The impossible week is proved
impossible in 96.

**Values are ordered least-loaded-first.** Ordering values does not change
which rotas exist; it changes which one is found first. A first answer that
is already roughly fair leaves the improvement pass less to undo.

**Then hill-climbing, for the soft constraints.** Hard constraints decide
whether a rota is legal and soft ones decide whether it is decent, and they
want different algorithms. A backtracker is good at "is there any
arrangement at all" and bad at "which arrangement is kindest" — it would
have to enumerate the legal ones to compare them. Swapping two people
between two shifts and keeping only swaps that are legal and cheaper is good
at the second question and cannot answer the first.

So: backtrack to legal, then climb to fair. Every state the climb visits is
legal by construction, which is why there is no repair step.

**The cost function, and the weight doing the work.** Contract hours
dominate, because an hour not worked is money somebody was promised and an
hour over is money the business did not budget. Night and weekend
distribution are squared deviations, so four nights for one person against
none for another costs far more than a one-night difference — which is how
people actually feel it. Preference is last and small: a rota that honours
every preference by paying somebody for twelve hours they did not work is
not a better rota.

## Two numbers that must not be the same number

`contract` is what somebody is paid for, and missing it is a **cost**.
`maxHours` is what they may not exceed, and exceeding it is **impossible**.
Collapsing them into one field means either paying for hours nobody worked
or rostering hours nobody may work, and which you get depends on which way
the comparison happened to be written.

## "Gave up" is not "impossible"

Backtracking is complete: given long enough it either finds a rota or proves
there is none. "Long enough" on a pathological week is minutes, and nobody
waits, so there is a cap of 200,000 nodes — two orders of magnitude above
anything the presets need.

When the cap is hit the page says **"gave up"**, not "no rota exists", and
says in so many words that this is not a proof. Those are three different
outcomes — solved, disproved, abandoned — and they get three different
words and three different colours. Collapsing the middle one into the last
is how a tool starts telling managers that legal rotas are illegal.

---

## Layout

```
src/
  main.tsx           mounts App
  App.tsx            presets, rule switches, the rota, the people, the why
  model.ts           shifts, roles, staff, rules, the rest arithmetic
  data.ts            ten staff, the branch's cover, four weeks
  build.ts           preset + rules → problem, used by the worker and tests
  solver.ts          legality, the counting prechecks, the search, the climb
  solver.worker.ts   the chunked loop that makes Cancel work
  protocol.ts        the message types, so the two sides cannot drift
  useSolver.ts       worker lifecycle, progress, cancellation
  styles.css         tokens for both themes, then everything else
```

## Things worth knowing before changing it

**Do not replace the `setTimeout` in the worker with a tight `while`.** It
will be a few per cent faster and the Cancel button will stop working, and
nothing will fail — the button will simply do nothing until the answer
arrives.

**The rest check runs in both directions.** A night already rostered on
Tuesday forbids Wednesday morning, *and* a Wednesday morning already
rostered forbids Tuesday night. The search fills slots in neither calendar
order nor reverse, so a one-directional check is wrong about half the time.

**A night's `end` is 31, not 7.** Hours are counted from the start of its
own day, so 21:00–07:00 ends at hour 31 and the next morning starts at
7 + 24 = 31. Zero rest, with no special case in the arithmetic.

**`protocol.ts` exists so the worker boundary is typed.** A `postMessage`
is otherwise the one place in a TypeScript application where `any` gets in
without anybody choosing it. Both sides import the same unions, so a
message shape that changes on one side stops compiling on the other.

**`new URL("./solver.worker.ts", import.meta.url)` is not decoration.** It
is what lets the bundler see the worker as a module graph of its own. A
literal path there works in development and ships a 404.

**The cover table is in `data.ts`, not `model.ts`.** How many people a
branch puts on an evening is a commercial decision about one branch. The
model should not have to be edited to roster a different one.

**Role names go through `roleWord()`.** The ids are machine words and the
messages are read by a branch manager: "has no assistant who can work it"
is wrong twice — the role is a counter assistant, and the article is "a".
Both are the kind of failure that makes a generated explanation read as
generated.

---

## How it looks, and why it is not the house style

**Institutional document.** The five projects in this repository deliberately do not
share a palette. Each is a demonstration of a different thing and is
dressed as that thing; only `kioo`, which *is* the Genmars design system,
wears the company's colours. A portfolio where every piece looks the same
is a portfolio that shows one piece.

A rota is a legal document before it is anything else, so it is dressed
like one: cool paper, an ink-blue accent, Newsreader for the headings and
Libre Franklin for anything read in a hurry. Newsreader carries an optical
size axis, so the masthead is set at the display end of it and the panel
headings at the text end — out of one file.

The accent and `--busy` are deliberately close blues. They are never
adjacent: the accent is a tab underline and a selected card, `--busy` is a
pill in the status bar. Unrelated hues would have put a fifth colour on a
page that is mostly a grid of names.

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
Newsreader and Libre Franklin are self-hosted in `public/fonts/` under the SIL Open Font
Licence, included alongside them.
