# Nero 26 — concept livery

A Formula 1 concept site for an invented team, Scuderia Nero. Six sections: a
countdown-lights loader, a hero, a car you strip down by scrolling, a wheel
you drag, a driver reveal, the closing rounds of a season, and a gallery.

A Genmars Tech front-end demo. There is no backend. Two of the images are
local and the rest come from Unsplash.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

`npm run verify` is the gate, as it is in every frontend the company runs.

---

## ⚠ Before this is published anywhere

**The hero image is a real Ferrari, not concept art.** `public/assets/car.jpg`
is a render of a current-generation Formula 1 car in a black livery carrying
the prancing horse, car number 16, and the marks of Shell, Santander, Richard
Mille, Ray-Ban, HCLTech, VGW, AWS, Pirelli, Brembo, NGK and SKF.
`public/assets/helmet.jpg` came from the same set. Both arrived with the
design file, where they are credited as "concept imagery".

They are not concept imagery, and the footer line "Concept website · not
affiliated with any team" does not licence somebody else's trade dress. This
matters more than usual here, because the whole design is built to look like
a team's own site.

Nothing has been cleared. The credits in `src/data.ts` now say what is
actually known rather than repeating the design's claim, and **both files are
held out of git** — `genmarstech/projects` is public, so committing them
would publish them under the company's name. `.gitignore` says so at the
bottom. Run `npm run dev` and the two `<img>` tags 404 until you put them
back in `public/assets/`.

**Decide this before deploying**, and especially before listing it on
`genmars.co.ke/work`:

- replace both images with licensed or generated ones, or
- keep them for a private demo that is never linked publicly, or
- confirm a licence exists.

Charter 04 §IV — nothing untrue on a Genmars surface — is the reason this is
at the top of the file rather than a footnote.

---

## What is in it

One page, six sections, no router.

- **Loader** — five lights and a 000→100 counter, then the curtain lifts and
  the headline rises out of its mask.
- **01 Hero** — the car, a light sweep, a parallaxing title.
- **02 Machine** — 420vh of scroll that moves a camera around a car built in
  code, with four callouts pinned to points on the bodywork, a livery picker
  and live telemetry.
- **03 Tyre lab** — a wheel you can drag, five compounds, four stats.
- **04 Driver** — 300vh of scroll that opens a `clip-path` on a helmet.
- **05 Season** — seven rounds; hovering one flies a photograph in beside the
  cursor.
- **06 Paddock** — an eight-tile mosaic into a keyboard-navigable lightbox.

Over all of it: a progress rule, a fixed nav with a lap counter, a custom
cursor, and a footer.

## Where it came from

Implemented from `Nero 26.dc.html` in the Claude Design project at
<https://claude.ai/design/p/6f0c4221-2971-46dd-a828-27edf135634b> — a template
in a bespoke `.dc.html` format with its own directives and a single
`renderVals()` holding the state. That runtime is not used here.

Colours, type, easings, geometry and copy are the design's. `src/theme.ts`
names every value that appears more than once.

## What diverges from the design, and why

**The three editor props became constants in `src/config.ts`.** `showLoader`,
`customCursor` and `motion` were knobs on a canvas. There is no canvas here,
so a prop panel would be a control nobody can reach.

**Three.js is a dependency, not a CDN import.** The design did
`await import('https://esm.sh/three@0.160.0')` at runtime. That is right for
a file that has to run standalone and wrong for a deployed site: it puts a
third party in the critical path of the page's centrepiece, it cannot be
pinned by a lockfile, and it needs a CSP that permits arbitrary remote
script. It is in `package.json` and Vite bundles it — but still **loaded on
demand**, because it is ~128kB gzipped and two sections out of six need it.
The entry chunk is 81kB gzipped; the renderer arrives when the car does.

**`overflow-x: clip`, never `hidden`.** Both are needed on `html` *and*
`body` or the page still scrolls sideways. But `overflow-x: hidden` computes
`overflow-y` to `auto`, which makes the root a scroll container — and
`position: sticky` then sticks to that instead of the viewport. Both pinned
sections silently stopped pinning and the car section rendered as a blank
screen with a canvas nobody could see. `clip` clips without creating a scroll
container. This is written on the rule in `styles.css` too.

**`prefers-reduced-motion` switches off the pinning, not just the fades.**
The design had no reduced-motion handling at all. Two sections here are
scroll-jacked — seven viewport-heights of scrolling that move a camera rather
than the page — which is the strongest form of the motion that setting asks
us not to make. Under it the sections become ordinary blocks, the camera
choreography and the speed streaks stop, the parallax multiplier goes to
zero, and everything that was waiting on an observer is simply shown.

**The same switch runs below 860px**, where a pinned section is most of a
phone screen. There the four callouts stop being pins floating over a canvas
too small to hold them and become a list under the car — the same four facts
in the one form that fits. That list is in the markup all the time; CSS
decides which is showing.

**The hotspots lost their hard-coded positions.** The design gave each one an
`x`/`y` percentage and then overwrote it every frame with a position
projected from 3D, so the percentages only decided where a pin sat for the
one frame before the scene loaded. `src/data.ts` keeps the model-space
anchor and nothing else; a hotspot stays hidden until it has a projection.

**The calendar rows answer to focus as well as hover.** The preview was
`onMouseEnter` only, which makes it invisible to anyone not using a mouse.
The gallery tiles are `<button>`s rather than divs with click handlers, for
the same reason — they open a modal, so they have to be operable from a
keyboard.

**The lightbox traps nothing but does move focus.** Opening it focuses the
close button and locks body scroll; the design did neither, so the gallery
scrolled underneath the picture you were looking at.

## The images, and why they are .jpg

The design's `assets/car.png` and `assets/helmet.png` could not be read
whole: the design API caps a file read at 256 KiB and both PNGs are larger,
so what came back was exactly 192 KiB of valid PNG with no `IEND` chunk —
truncated, not corrupt, which is harder to notice.

The same project holds the JPEG sources those PNGs were made from, and both
are under the cap. They arrive rotated 90°, so they were turned back with
`jpegtran` (lossless, no re-encode) and now match the PNGs' dimensions
exactly: 1472×736 and 1312×736. Read the warning at the top of this file
before assuming they are usable.

## Layout

```
src/
  main.tsx          mounts App, imports the stylesheet
  App.tsx           the six sections and the five things that outlive them
  config.ts         the design's editor props, plus the pin breakpoint
  theme.ts          colours, faces, width axis values, easings
  types.ts          Compound, Livery, Hotspot, Shot, Race
  data.ts           every word and figure on the page
  useStore.ts       the four things that are state
  useScrollFx.ts    everything that moves, in one rAF pass
  styles.css        reset, keyframes, hover, both pinned states, breakpoints
  three/car.ts      the car, modelled in primitives, plus the camera track
  three/tyre.ts     the wheel, and the drag
  sections/         Hero, Machine, TyreLab, Driver, Calendar, Paddock
  components/       Loader, Cursor, Nav, Marquee, RowPreview, Lightbox, Footer
```

## Things worth knowing before changing it

**Nothing that moves goes through React.** The telemetry, the hotspots, the
cursor, both WebGL scenes and every parallax offset are written straight to
nodes from one rAF pass. `useScrollFx` looks its targets up by data attribute
once on mount, which is why a section component can stay a description of its
markup. The rule that keeps it safe: that file only ever writes.

**`useScrollFx` runs its effect once, on purpose.** Re-running it would
rebuild two WebGL scenes. The livery crosses into the render loop through a
ref, and the compound colour through one small effect that sets a material.

**The car is modelled, not loaded.** No `.glb`, no download, and the
materials *are* the model — which is the only reason the livery picker
recolours instantly and the callouts can hang off points on the bodywork.

**`PIN_MIN_WIDTH` and the `max-width: 860px` block must move together.** One
is in `config.ts` and one is in `styles.css`; they are written from opposite
sides of the same number.

**The figures are invented.** 1,000 HP, 352 km/h, 5.2 G, the tyre stats, the
lap deltas — set dressing for a design piece. The circuits on the calendar
are real places; nothing else here is.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`, with
no server-side anything. See the warning at the top before making it public.
