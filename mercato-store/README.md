# Mercato — storefront

The customer-facing half of the same grocery shop: the front page, the aisles,
the basket, the checkout and the order you are waiting on. Its sibling
[`mercato-admin`](../mercato-admin) is the staff side of the same brand — the
storefront's footer links out to the deployed dashboard.

A Genmars Tech front-end demo. There is no backend: the catalogue of
twenty-three products lives in `src/data.ts`, nothing is persisted, and the
photography comes from Unsplash.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

`npm run verify` is the gate, as it is in every frontend the company runs.

## What is in it

One page, four views, no router.

- **Home** — a three-slide hero that rotates every 6.5 seconds, a marquee of
  six claims, the seven departments as circles, a scroll-pinned harvest rail
  of eight cards, best sellers under five tabs, a six-ingredient recipe
  bundle, and the delivery-or-collection picker
- **Shop** — search, department (with Deals sitting among them), diet, a price
  ceiling and four sorts, all composing
- **Checkout** — three numbered steps: how you want it, when, and how you
  pay. Six two-hour windows across six days, or one of three stores
- **Track** — five stages advancing on a 3.2-second timer

Over all four views, outside them: the header with its delivery/pickup switch
and basket count, the footer, the basket drawer, the product sheet and the
add-to-basket toast. They sit there because they belong to the shop rather
than to a screen — and the drawer and the sheet in particular must stay
mounted, because both have an exit animation and a screen change must not cut
one in half.

Free delivery over $50, $4.99 below it, collection always free, and one promo
code — `FRESH10`, for 10% off groceries.

## Where it came from

Implemented from `Mercato Grocery.dc.html` in the Claude Design project at
<https://claude.ai/design/p/9ca3cc40-b625-42b8-9af4-6752625a576f> — a template
in a bespoke `.dc.html` format with its own directives and a single
`renderVals()` holding the state. That runtime is not used here. The design was
imported and reimplemented as a Vite app, not transcribed into one.

Colours, type, radii, easings and copy are the design's. `src/theme.ts` names
every hex that appears in the file so a colour used in twenty places is one
value.

## What diverges from the design, and why

**The three editor props became constants in `src/config.ts`.**
`heroAutoplay`, `pinnedRail` and `freeThreshold` were knobs on a canvas —
somebody dragging the threshold slider and watching the basket recompute.
There is no canvas here, so a prop panel would be a control nobody can reach.
They are `HERO_AUTOPLAY`, `PINNED_RAIL` and `FREE_DELIVERY_THRESHOLD`, still
named and still in one file, because each is a commercial decision somebody
will want to change rather than an implementation detail.

**State lives in `src/useStore.ts`, derivation lives in the screens.** The
design's `renderVals()` returned a few hundred flat fields computed in one
pass. That suits a template with no logic in it and is wrong here: the order
tracker ticks every 3.2 seconds, and each tick would re-derive the shop's
filtered list, the product sheet's pairings and the whole checkout whether or
not any of them is on screen. The one exception is `totals`, which the header,
the drawer, the checkout summary and the place-order button all read, and
which must agree across all four or the shop has two prices.

**The rail parallax is clamped.** The design's own arithmetic,
`(p * dist - i * 300) * -0.04`, reaches roughly ±85px at the ends of the rail,
against frames the photographs exactly fill — so a strip of card ground showed
at the edge of the later cards. `PAR_LIMIT` in `src/useScrollFx.ts` clamps the
offset, and `PAR_OVERSCAN` in `src/sections/HarvestRail.tsx` draws the
photographs that much wider on each side. **The two numbers must stay equal**;
drift further than the overscan and the photograph's edge appears inside its
own frame. Both are 40.

**`prefers-reduced-motion` switches off the pinning as well as the parallax.**
Scroll-jacking is the strongest form of the movement that setting asks us not
to make, so honouring it for the fades and not for the pin would miss the
point. The same is true below 700px, where the rail is most of the viewport
and a thumb-swipe down would move pictures sideways.

**One Unsplash photo id was swapped.** Unsplash reassigns ids, and the
design's `1618160702438-9b02ab6515c9` now resolves to a birthday cake — which
sat under "Subscribe & save 5% / Repeat your weekly staples" in the shop
sidebar. It is now `1488459716781-31db52582fe9`. The same has happened to the
Country Sourdough photograph, `1519996529931-28324d5a630e`, which is now a
fruit bowl; that one was left alone because it is the design's own catalogue
data rather than our own dressing. Recorded here so the next person knows it
is known and not missed.

**The category tiles pluralise.** "1 item", not "1 items". The count is
counted from the catalogue rather than typed in, because a hand-written
"12 items" is wrong the first time somebody adds a product and nothing ever
notices.

## Layout

```
src/
  main.tsx          mounts App, imports the stylesheet
  App.tsx           the four views, and the five things that outlive them
  config.ts         the design's editor props, plus fee, promo and admin URL
  theme.ts          colours, faces, radii, easings, the reveal resting state
  types.ts          Product, View, Cart, Order and the small unions
  data.ts           the catalogue, hero slides, rails, stores, slots, money()
  useStore.ts       all state and every action; `totals` is the one derivation
  useScrollFx.ts    every scroll-linked effect, in one rAF pass, plus useReveal
  styles.css        what inline styles cannot express
  sections/         the home page, top to bottom — Hero, Categories,
                    HarvestRail, BestSellers, RecipeBundle, OrderYourWay
  screens/          Home, Shop, Checkout, Track
  components/       Header, Footer, Marquee, CartDrawer, ProductModal, Toast,
                    and ui.tsx — the controls the design repeats
```

## Things worth knowing before changing it

**The catalogue is fixed, not generated.** Prices, units, origins and copy are
the design's, and `isFull` decides booked slots by arithmetic rather than a
random draw. A basket total in a screenshot today is the same total in a
screenshot next month.

**Styling is inline, on purpose.** The design file is styled entirely inline,
and keeping the mapping one-to-one means a component can be diffed against the
design by eye. `styles.css` is one small stylesheet holding only what an
inline style has no syntax for: the reset, the two keyframes, hover, focus,
every media query, and the reduced-motion opt-out. Responsive behaviour
therefore lives in two places — the `clamp()` calls inline, and the breakpoints
in that file — and nowhere else.

The phone rules carry `!important` because they are overriding inline styles,
which is the one thing that beats a stylesheet. That is the cost of mirroring
the design's inline styling, and it is paid in one place on purpose: if a rule
there stops working, the inline style it was written against has changed.

**The header's height is measured, not declared.** `useScrollFx` reads it to
decide where the pinned rail sticks. That is why the header is sized by its
content and never given a height: it folds from one row to three between the
desktop and a phone, and a hard-coded number would leave the rail underlapping
it at every width but the one the number was written for.

**The rail's two states are split between the component and the stylesheet.**
Pinning needs all three of `useScrollFx`'s conditions: `PINNED_RAIL`, a
viewport wider than `PIN_MIN_WIDTH`, and no reduced-motion preference. Only
the first cannot change at runtime, so only the first is decided in the
component — it arrives as the `railScrollPinned` and `railHintPinnable`
classes, and the other two are decided in `styles.css`, which means the width
that governs the rail is written once. **Unpinned is the base state**, so a
scroller nobody has pinned is swipeable by default. It used to be an inline
`overflowX: PINNED_RAIL ? "hidden" : "auto"`, which consulted the constant and
nothing else: below 700px the hook stopped pinning and cleared the transform
while the scroller stayed `hidden` over a `max-content` track, and every card
past the first was unreachable on a phone. The hint had the same fault and
told a phone to "Keep scrolling" when scrolling did nothing.

**Placing an order is the one destructive action.** It empties the basket and
spends the promo code, so it refuses rather than guesses when no slot is
chosen, and says so in the toast instead of disabling a button with no
explanation.

**A collection order is never "out for delivery".** Both the tracker's step
names and the paragraph under its headline come from the fulfilment mode. A
tracker that says the wrong thing confidently is worse than one that says
less.

**Nothing claims a live feed.** The tracker walks a timer, the photograph is a
van rather than a map with a moving pin, and the basket's suggestions are a
fixed list of staples rather than an invented "often bought together". There
is no order history to mine and no affinity model behind it.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`, with
no server-side anything. `ADMIN_URL` in `src/config.ts` is the sibling
dashboard's production alias, hard-coded because the two are separate
deployments; it needs updating if the admin moves.
