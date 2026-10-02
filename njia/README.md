# Njia — a Nairobi matatu arrival board

Six real corridors, twenty-five real places, and a morning that is entirely
invented. Pick a stop and the board tells you what is coming and how much to
trust the number; the map beside it shows where everything is; the panel
underneath names the pairs of vehicles that have closed up on each other.

A Genmars Tech demonstration. There is no backend and no feed.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

---

## What is real and what is not

**Real:** the routes. 46, 111, 23, 58, 125 and 33 are corridors people queue
for. The places are real places and the coordinates are approximate — read
off public landmarks to within a block, which is all a city-scale drawing
needs.

**Not real:** every vehicle, every time, every delay and every plate. No
operator supplied data, none was scraped, and nothing in this repository
talks to anything. `src/sim.ts` generates the whole day in the browser from
one seed.

That distinction is printed above the fold on the page itself, in the same
type as everything else. A board that looks like this and is not connected
to anything is the one genuinely dishonest thing this project could do, so
it is the first thing it says.

---

## The three things worth looking at

### 1. The map has no map in it

No tile server, no map library, no key, no third-party request. The whole
projection is nine lines in `src/paint.ts`: equirectangular about the centre
of the data, with longitude scaled by cos(latitude) so the city is not
stretched sideways.

Across Nairobi — some 40 km of longitude — treating the ground as flat is
wrong by a few metres, against stop coordinates that are approximate to a
block. The error is three orders of magnitude below the data's own
precision. A slippy map would have put somebody else's CDN in the critical
path of the page's centrepiece, needed a key in a public bundle, and shipped
two hundred kilobytes to draw twenty-five dots.

Charter 03 §I: a dependency enters the stack when what is already there
cannot do the job. Arithmetic can do this job.

### 2. Nothing accumulates

A vehicle's position is integrated from its departure **every time it is
asked for**, rather than advanced a tick at a time and stored.

That costs a few thousand multiplications a second and buys the only
property that makes the thing arguable: scrubbing the clock back to 07:41
shows exactly what 07:41 showed, whether you got there by playing forwards,
by dragging backwards, or by reloading the page. The seed is a constant for
the same reason — two people discussing the 07:41 bunch on route 58 are
discussing the same one.

The only accumulating state in the application is the clock itself, in one
hook, and the scrubber writes to it through the same door.

### 3. Bunching is the number, and the headway is not

Bunching is self-reinforcing, and it is the ordinary failure of a
high-frequency route. The vehicle in front picks up everybody waiting, so it
dwells longer and falls further behind. The one behind arrives at stops that
have just been emptied, sails through, and catches it.

From the kerb that is a twenty-minute wait followed by three matatus at
once — on a route the operator will correctly tell you runs every six
minutes. The average headway stays honest while the service people actually
get falls apart, which is why the panel computes live gaps rather than
reading the timetable.

The simulation reproduces it from two inputs and no special-casing:
dispatch jitter, and a spread of driving paces. At 06:30 there are usually
two bunches across the whole city; by 08:00 there are seven.

---

## Where the honesty shows up in the interface

**Every ETA prints a range.** `4 min ±1`, `23 min ±6`. A single number for a
vehicle twenty minutes out claims a precision the model does not have, and a
board that prints one teaches people to distrust all of its numbers rather
than just that one. The half-width grows with the distance left to cover and
with how congested that stretch is.

**The board is the product; the map is the illustration.** The table carries
every fact the drawing does, and it is first in the source. On a slow
connection and in a screen reader the table *is* the application. Below
880px it moves above the map, because a twenty-five-dot diagram at the size
of a stamp is not what somebody standing at a stage needs.

**The ETA integrates the congestion curve forwards.** An estimate issued at
07:10 for an arrival at 07:40 already knows the corridor is about to get
worse. A board that assumed the current speed would hold is the one that
says four minutes at the exact moment four minutes stops being true.

**There is no "just left" row.** A board listing a matatu you cannot catch
is a board people learn to read past.

---

## Layout

```
src/
  main.tsx      mounts App
  App.tsx       masthead, clock, the grid, the two panels
  Map.tsx       the canvas, and the four things a canvas always needs
  network.ts    stops, routes, haversine, cumulative distance
  sim.ts        the seed, the timetable, integration, arrivals, bunching
  paint.ts      the projection, the palette bridge, the drawing
  useClock.ts   the one place time accumulates; reduced motion; theme
  styles.css    tokens for both themes, then everything else
```

## Things worth knowing before changing it

**A canvas cannot read a custom property.** `ctx.strokeStyle` takes a
colour, and `var(--ink)` is not one — it resolves against an element, and a
canvas bitmap is not an element. So `readPalette()` reads the tokens off the
host node and passes them in, and `draw()` names a field of that object and
never a literal. `useDarkTheme` exists so the palette is read again when the
theme flips; without it the drawing keeps one theme's ink on the other's
ground.

**The canvas needs all four of its usual repairs.** Device-pixel-ratio
backing store, a `ResizeObserver` (a canvas does not reflow — it stretches
the bitmap it has), a palette re-read on theme change, and an accessible
equivalent. `Map.tsx` does each one and says which is which.

**Route hues are one number, used three times.** Each route carries a hue in
`network.ts` and nothing else; the board badge, the map line and the legend
swatch all derive their colour from it in CSS, at a lightness that flips
with the theme. That is how a colour on the drawing can be matched to a row
in the table without a second palette to keep in step.

**`prefers-reduced-motion` slows the clock rather than stopping it.**
Stopping it would remove the thing the page is for. Under the setting the
clock commits four times a second instead of sixty, so the vehicles step
rather than glide — which is the distinction the setting actually asks for:
motion that tracks the eye, versus a display that updates.

**Tuning bunching is tuning two numbers.** Dispatch jitter and the pace
spread, both in `seededSchedule`. The detection threshold is 40% of the
planned headway, and vehicles inside the first 600 m are excluded because a
terminus rank is a queue, not a bunch.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`,
with no server-side anything. The three typefaces are self-hosted in
`public/fonts/` under the SIL Open Font Licence, included alongside them.
