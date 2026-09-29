# Mercato — store operations

A grocery chain's back-of-house dashboard: the orders coming in, what is on
the shelves, who is on shift, and which delivery windows are still open.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
```

## What is in it

Seven screens and a slide-over:

- **Dashboard** — revenue by hour with Today/Week/Month, the fulfilment
  pipeline, live orders, low stock, top sellers
- **Orders** — filter by status, open any row into the drawer
- **Inventory** — edit prices in place, adjust stock, list and unlist
- **Delivery slots** — six days by six windows; set capacity, block a slot
- **Team** — who is on shift, what they are carrying
- **Customers** — segmented by lifetime orders
- **Promotions** — create a code, pause one, watch its cap
- **Order detail** — pipeline position, pick list, assign a shopper,
  advance or refund

Orders arrive on their own every twelve seconds. The switch in the header
stops that, which matters the moment you try to read the table.

## Where it came from

Implemented from a Claude Design project (`Mercato Admin.dc.html`) — a
template in a bespoke `.dc.html` format with `sc-for` / `sc-if` directives
and a `DCLogic` class holding the state. That runtime is not used here; the
template became JSX and `renderVals()` became React state plus per-screen
derivation.

Colours, type and layout are transcribed rather than reinterpreted. Where
this diverges, it says so in a comment.

## Things worth knowing before changing it

**The data is seeded, not random.** `data.ts` uses a linear congruential
generator from a fixed seed, so the opening fourteen orders are identical on
every load. `Math.random()` would mean a demo that differs in every
screenshot and a basket total nothing can check.

**State lives in `useStore`, derivation lives in the screens.** The design
computed every colour, label and percentage in one `renderVals()` returning
a few hundred fields. That suits a template with no logic in it and is wrong
for React — every screen would recompute on each tick of the live-order
timer whether or not it is on screen.

**Styling is inline, on purpose.** The source is a single design file styled
entirely inline, and keeping the mapping one-to-one means a component can be
diffed against the design by eye. `styles.css` holds only what inline styles
cannot express: the reset, the two keyframes, hover, focus, and the narrow
breakpoint.

**The rail becomes a header below 860px, and the design does not.** The
source makes it `position: sticky; height: 100vh` in a wrapping flex row —
correct on a desktop, unusable on a phone, where `main` wraps beneath a full
viewport of green navigation. The design was only ever drawn at desktop
width, so there was nothing to be faithful to.

**A pickup order is never "out for delivery".** `displayStatus` relabels it
to Ready and Collected. The underlying status is unchanged so filters and
the pipeline keep one vocabulary.
