# projects

Frontend work Genmars builds — client projects, product prototypes and
design implementations. One folder per project, each standing on its own.

| Project | What it is | Stack |
|---|---|---|
| [`mercato-admin`](./mercato-admin) | Grocery store operations dashboard — orders, inventory, delivery slots, team | Vite · React · TypeScript |

## How this repo is arranged

**One folder per project, independent.** Each has its own `package.json`,
its own lockfile and its own stack. `cd` into one, install, run.

That is deliberate rather than lazy. These are unrelated pieces of work for
different briefs, and a workspace monorepo would tie a grocery dashboard's
React version to whatever lands next. Coupling projects that share nothing
buys a smaller `node_modules` and costs the ability to pin anything.

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
