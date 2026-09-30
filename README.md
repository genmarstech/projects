# projects

Frontend work Genmars builds — client projects, product prototypes and
design implementations. One folder per project, each standing on its own.

| Project | What it is | Stack |
|---|---|---|
| [`mercato-admin`](./mercato-admin) | Grocery store operations dashboard — orders, inventory, delivery slots, team | Vite · React · TypeScript |
| [`mercato-store`](./mercato-store) | The same shop's storefront — aisles, basket, checkout, order tracking | Vite · React · TypeScript |
| [`nero-26`](./nero-26) | Formula 1 concept site — a car modelled in code, scroll-driven teardown, 3D tyre | Vite · React · TypeScript · three |

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

## Adding one

```
projects/<name>/
  README.md        what it is, how to run it, where the design came from
  package.json     with a `verify` script CI can call
```

Give it a `verify` script that does whatever "this is not broken" means for
that stack — typecheck and build, at minimum. It is the one convention
worth holding across otherwise independent projects.
