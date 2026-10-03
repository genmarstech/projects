# projects

Frontend work Genmars builds — client projects, product prototypes and
design implementations. One folder per project, each standing on its own.

| Project | What it is | Stack |
|---|---|---|
| [`mercato-admin`](./mercato-admin) | Grocery store operations dashboard — orders, inventory, delivery slots, team | Vite · React · TypeScript |
| [`mercato-store`](./mercato-store) | The same shop's storefront — aisles, basket, checkout, order tracking | Vite · React · TypeScript |
| [`nero-26`](./nero-26) | Formula 1 concept site — a car modelled in code, scroll-driven teardown, 3D tyre | Vite · React · TypeScript · three |
| [`mvule-co`](./mvule-co) | Nairobi furniture shopfront — KES pricing, WhatsApp ordering, M-Pesa deposits | Vite · React · TypeScript |
| [`stk-lifecycle`](./stk-lifecycle) | R&D — interactive teardown of the M-Pesa STK push lifecycle, and why the callback cannot be trusted | Vite · React · TypeScript |
| [`njia`](./njia) | Nairobi matatu arrival board — six real corridors, a deterministic morning, bunching detection, a map drawn with no map library | Vite · React · TypeScript |
| [`shamba`](./shamba) | Offline-first field survey — field-level CRDT merge on Lamport counters, and what whole-record last-write-wins quietly discards | Vite · React · TypeScript |
| [`ratiba`](./ratiba) | Duty roster solver — backtracking with MRV in a cancellable Web Worker, and an explanation when no rota exists | Vite · React · TypeScript |
| [`kioo`](./kioo) | The Genmars design system — tokens, eight components, and contrast measured in the browser rather than documented | Vite · React · TypeScript |
| [`mizani`](./mizani) | Columnar query engine — dictionary-encoded store, a hand-written SQL subset, and a plan that says what it read | Vite · React · TypeScript |

## How this repo is arranged

**One folder per project, independent.** Each has its own `package.json`,
its own lockfile and its own stack. `cd` into one, install, run.

That is deliberate rather than lazy. These are separate pieces of work for
separate briefs, and a workspace monorepo would tie a grocery dashboard's
React version to whatever lands next. Coupling projects that need not agree
buys a smaller `node_modules` and costs the ability to pin anything.

Two of them share a brand rather than a build. `mercato-admin` and
`mercato-store` are the staff and customer halves of one shop and carry the
same palette and the same three typefaces — each copied into its own
`theme.ts`, not imported from a shared package. A duplicated palette is the
cheaper mistake: extracting it would make a colour change in one deploy a
rebuild of the other, for two projects that are each finished.

Each project carries its own README with what it is and how to run it.

## What they are for

They are demonstrations, and each one is built around a single engineering
argument it can make better than a sentence can:

- **`njia`** — that a city-scale map needs a projection, not a map library,
  and that a simulation whose history depends on how you arrived at a
  moment cannot be used to argue about anything.
- **`shamba`** — that the merge rule most sync layers ship converges
  perfectly and is still losing data, and that the list of six discarded
  observations is the argument the abstract one never wins.
- **`ratiba`** — that the valuable output of a solver is the one where it
  fails, and that "no solution found" is true and useless.
- **`kioo`** — that a design system's accessibility figures should be
  measured rather than written down. It found a real failure in its own
  tokens the first time it ran.
- **`mizani`** — that storing down the columns is worth it, and that a
  query plan which reports what it actually touched is how you know.

Charter 03 §I runs through all of them. Between the five there is no map
library, no SQL parser, no dataframe library, no charting library, no CSV
library, no constraint solver and no CRDT library. The only runtime
dependency any of them has beyond React is `three`, in `nero-26`.

## Adding one

```
projects/<name>/
  README.md        what it is, how to run it, where the design came from
  package.json     with a `verify` script CI can call
```

Give it a `verify` script that does whatever "this is not broken" means for
that stack — typecheck and build, at minimum. It is the one convention
worth holding across otherwise independent projects.
