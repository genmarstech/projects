# Mvule & Co.

A shopfront for an invented Nairobi furniture maker: seven views, fourteen
pieces, KES pricing, WhatsApp ordering and an M-Pesa payment sheet. Built to
show what a Kenyan retailer's site could look like when it is designed around
how people here actually buy — a deposit, a WhatsApp thread and a showroom
visit, not a card form.

A Genmars Tech demonstration site. There is no backend; the photography comes
from Pexels.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

`npm run verify` is the gate, as it is in every frontend the company runs.

---

## Nothing here takes money, and two things were changed to keep it that way

The page is written to be believed, which is the point of a demonstration and
also its only real hazard. Two details in the design could have cost a
stranger money if they were followed:

- **The paybill.** The design printed business number **247 247** on the
  "Paybill details" tab, beside a real-looking amount and five numbered
  steps. That is a real Kenyan paybill belonging to somebody else. `PAYBILL`
  in `src/data.ts` is now `000 000`, which cannot be paid to.
- **The payment sheet looks exactly like a real one**, down to the STK copy
  telling you to enter your PIN. It is local state and always was — no
  request is made. The modal now says so before you type a phone number, and
  the "check your phone" step says plainly that nothing was sent.

The footer carries a demonstration notice for the same reason: the workshop,
the fundis, the reviews, the showroom and the prices are all invented.

**One thing is not fixed.** `WHATSAPP_NUMBER` is `254712345678` —
0712 345 678, the conventional Kenyan placeholder. Safaricom reserves no test
range, so it may belong to a real person, and every WhatsApp button and the
`tel:` link point at it. Replace it before this is shown to anyone likely to
tap it.

---

## What is in it

Seven views, one page, no router.

- **Home** — hero, trust strip, six categories, a bestseller rail, the
  workshop story, four styled rooms, reviews, delivery zones, an Instagram
  grid.
- **Shop** — category chips, price/material/colour filters (a sidebar on
  desktop, a bottom sheet on a phone), four sorts, removable active filters,
  and a "we'll make it for you" empty state.
- **Product** — a four-pane snap gallery with dots, colour swatches, specs,
  M-Pesa and WhatsApp buy paths, a delivery estimate that changes with the
  area you pick, an accordion, related pieces, and a sticky buy bar on mobile.
- **Custom orders** — a five-part brief with a local image uploader.
- **Our workshop** — the story, the craftsmen, the materials.
- **Showroom** — map, address, hours, directions.
- **Contact** — four contact cards, socials, a message form.

Plus a quick-view modal, the M-Pesa sheet, a floating WhatsApp button and a
mobile menu.

## Where it came from

Implemented from `Mvule & Co Website.dc.html` and its `ProductCard.dc.html`
in the Claude Design project at
<https://claude.ai/design/p/77fabc56-27a3-404f-b7f0-b7985f4c94da>.

## What diverges from the design, and why

**It is still a rebrandable template, and that was deliberate.** Unlike the
other projects here, the editor props were not simply flattened into
constants. The design's own stylesheet opens with "edit here to rebrand", and
`palette` and `fontPairing` each offer three complete schemes. All six are
kept in `src/theme.ts`; `src/config.ts` picks one. Change `BRAND_NAME`,
`PALETTE` and `FONT_PAIRING` and the whole site follows, because every colour
and face on the page is a CSS custom property written from those values.

That inverts the usual rule in this repository: **do not hard-code a hex in a
component here**, or the rebrand quietly stops working.

**The fonts are injected, not linked in `index.html`.** Three pairings, two
families each — a static link would load the wrong pair the moment somebody
switched `FONT_PAIRING`, and the page would silently render a fallback.
`src/main.tsx` builds the Google Fonts URL from the same constant the CSS
variables come from.

**`<image-slot>` became `<img>`.** Every picture in the design is a custom
element from the design tool: a drop target that persists a dragged file to a
sidecar JSON beside the HTML. Its own documentation says it is read-only
outside that runtime. What was worth keeping is the `placeholder` text —
written for an editor to know what belongs in the slot, and reused here as
the `alt`, which is the same sentence doing a more useful job.

**`ProductCard` derives its own labels.** The design passed in a
pre-decorated object with `priceLabel`, `meta`, `sw` and four callbacks
already built, because the template language cannot call a function in
markup. React can.

**`overflow-x: clip`, never `hidden`.** Both are needed to stop sideways
scroll, but `hidden` computes `overflow-y` to `auto`, which makes the root a
scroll container — and `position: sticky` then sticks to that instead of the
viewport. The header and the product page's mobile buy bar are both sticky
and would both have stopped. Learned on a sibling project, written on the
rule in `styles.css`.

**The modals close properly.** The design closed on a backdrop click only.
Both now close on Escape, move focus into the dialog on open, and lock the
page behind — without which the shop scrolls underneath the sheet you are
reading on a phone.

**No portraits of the craftsmen.** The design left those three image slots
empty. Filling them with stock photographs would attach a real person's face
to an invented name and a biography they never gave. The tile shows what the
photograph would be instead, which is honest about the gap.

**The map points at Westlands, not an address.** Mvule House is invented;
dropping a pin on a real building sends somebody to a stranger's door.

**`creditUrl` points at `genmars.co.ke`.** The design defaulted to
`genmarstech.com`, which is not the company's site.

**The remembered route is validated.** The design wrote `page` and `pid` to
localStorage and read them straight back. A stale id from a catalogue that
has since changed would render a product page with nothing in it, so both are
checked against the real data on boot. Only those two are persisted — coming
back to a shop wearing somebody's fortnight-old filters reads as a broken
catalogue.

**Object URLs are revoked.** The custom-order uploader leaked a blob per
picked file for the lifetime of the tab.

## Layout

```
src/
  main.tsx          applies the theme and injects the font link, then renders
  App.tsx           the seven views and the four things that outlive them
  config.ts         brand, palette, pairing, WhatsApp number, delivery floor
  theme.ts          three palettes, three pairings, swatches, applyTheme
  types.ts          Product, Zone, Review, Craftsman, Material, Room, Page
  data.ts           the catalogue, zones, copy, and the payment-safety notes
  useStore.ts       all state, routing, and the WhatsApp link builders
  useReveal.ts      the fade-and-rise, re-scanned on every view change
  styles.css        reset, hover states, reveal, breakpoints, reduced motion
  components/       Header (and mobile menu), Footer, ProductCard, Modals, ui
  screens/          Home, Shop, Product, Custom, About, Showroom, Contact
```

## Things worth knowing before changing it

**The palette is applied before the first render**, not in an effect. Every
element is styled against `var(--c-ink)` and friends, so a frame rendered
before those exist is a frame of unstyled text.

**Only elements below the fold start hidden.** An element already on screen
is revealed immediately — otherwise the top of a freshly-rendered view sits
blank waiting for an intersection that has already happened. Under
`prefers-reduced-motion` nothing starts hidden at all.

**Prices, zones and reviews are invented** but internally consistent: the
free-delivery threshold in the announcement, the delivery section, the zone
table and the product page all read the one constant.

**Three Pexels ids are used in more than one place** — the workshop
photograph appears on Home and in Our workshop, deliberately, as the same
room. All 23 ids were checked to resolve; CDNs do reassign, so check again if
a tile goes blank.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`, with
no server-side anything. Photography is fetched from the Pexels CDN at
runtime rather than re-hosted.
