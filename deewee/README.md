# DeeWee Natural Oils

A concept website for DeeWee Natural Oils — hand-blended hair oil sold out
of Star Mall, 2nd floor, Shop B7, Nairobi. Hero, philosophy, a three-product
shop, the nightly ritual, a two-question hair quiz that recommends a
routine, a draggable before/after comparison, reviews in English and
Swahili, FAQs, and a basket that totals an order and hands it to WhatsApp
with M-Pesa paybill instructions.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

`npm run verify` is the gate, as it is in every frontend the company runs.

---

## Where this came from

Designed in Claude Design as `DeeWee Website.dc.html` and handed off for
implementation. That format only renders inside the Claude Design editor —
`<x-dc>`, `sc-if`/`sc-for`, `{{ }}` bindings, a `DCLogic` base class — so
this is the same page, same copy, same state machine, reimplemented as a
real React site rather than ported mechanically. `src/App.tsx` follows the
original's own `renderVals()` section for section; `src/data.ts` carries
the product, quiz, review and FAQ content across unchanged.

Four images came with the handoff as local files and are checked in under
`public/assets/`: the product bottle, the whipped butter tub, and the
before/after pair used in the results comparison. Everything else — the
manifesto portrait, the ritual photo, the quiz photo and the four Instagram
tiles — are hot-linked Unsplash photos, each credited in-page with a link
to the photographer, exactly as the design specified them.

## Two things worth checking before this goes anywhere public

The design carries what read as real business details, not placeholders —
an M-Pesa paybill and account number, two WhatsApp numbers, a specific
shop location. Unlike the other demonstration sites in this repo, which
invent their numbers on purpose, this page was not asked to fictionalise
anything, so it did not:

- **The M-Pesa paybill (400200) and account (892668).** If these are not
  live and correct, a real customer following the checkout instructions
  sends money nowhere useful.
- **The WhatsApp numbers (0705 472 849, 0717 644 557).** The basket, the
  quiz result and the "Visit" section all build a `wa.me` link straight to
  the first one.

Also still on: `showConceptBadge` (the "Website concept for DeeWee Natural
Oil" pill, bottom-left) is hardcoded on in `src/App.tsx`, matching the
design's own current default. Flip `SHOW_CONCEPT_BADGE` to `false` there
once this stops being a concept.

## A note on the quiz and the comparison slider

Both are state, not navigation — `src/App.tsx` holds `step`/`concern`/
`style` for the quiz and `slider` for the before/after drag, the same shape
the original `Component extends DCLogic` class used. Hover treatments the
design expressed with its own authoring-time `style-hover="..."` attribute
are real CSS classes in `src/styles.css` instead, named for where each one
is used.
