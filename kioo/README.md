# Kioo — the Genmars design system

Four brand constants, a set of semantic tokens, eight components, and one
rule the whole thing exists to enforce.

Every contrast figure on the site is measured in your browser when the page
loads. Nothing about this system's accessibility is a number somebody typed
into a document.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

---

## The rule

There are two kinds of colour here and they must never be confused.

**Brand constants** are fixed. Deep Well is `#2e2b34` in every theme, on
every surface, for ever. **Semantic tokens** are roles: `--bg` means "the
page's ground" and `--ink` means "text on that ground", and both change
value when the theme does.

> A brand constant used as a background while the text on it uses a
> semantic token produces a light band with light text in one of the two
> themes.

That has shipped. It is why `check-theme-tokens.mjs` runs in all three
Genmars frontends, and it is why this project exists. The constants appear
exactly once in the codebase — in the derivation of the semantic tokens —
and nothing outside `tokens.css` may name one.

## The audit caught a real failure while this was being built

The Contrast tab measures fifteen pairs in each theme, from probe elements
given `color: var(--token)` inside a scope carrying that theme, reading the
computed values back as resolved `rgb()`.

On the first run it came back red on a pair nobody had thought to check:

```
rule-strong on bg   the border of an input   1.79   needs 3   FAILS
```

WCAG 2.2 §1.4.11 asks 3:1 of the visual boundary that identifies a control.
At `rgba(46, 43, 52, 0.3)` the border of every input in the system was a
perfectly pleasant hairline at 1.79:1. It was not caught by reading the
file. It was caught because the page measures instead of documenting — and
that is the whole argument for building it this way, demonstrated on
itself. The token is now `0.56` in light and `0.42` in dark, and all thirty
pairs pass.

### Why both themes are measured at once

Each table sits inside a scope stamped `data-theme`, so it inherits a
complete token set regardless of which theme the reader is in. Auditing
only the theme you happen to be in is auditing half of it.

That is also why the token layer assigns every dark value **twice** — once
inside `prefers-color-scheme: dark` for the un-stamped default, once under
`[data-theme="dark"]` for an explicit choice. A theme has three states, not
two, and the third is the one most people are in.

The *colours* are still declared once, as `--d-*`, and both places
reference them. A colour that exists in one of the two and not the other is
the classic unreadable component.

---

## What is in it

**Tokens** — four brand constants, eighteen semantic tokens including four
state colours, a 1.25 type scale from a 15px body, a 4px space grid, radii,
and a 68-character reading measure.

**Components** — `Button`, `TextField` / `TextArea` / `SelectField`,
`Chip`, `Callout`, `Empty`, `Tabs`, `Dialog`, `DataTable`, `Money`.

They are deliberately plain. A design system earns its keep on the field
that wires its own label, the dialog that gives focus back and the chip
that does not borrow the brand colour — not on anything that looks clever
in a screenshot.

### The six rules, and what each costs to break

1. **A brand constant is never a background for semantic text.** One theme
   is readable; the other is not; and whoever built it was in the theme
   where it worked.
2. **State colours are not the accent.** A success chip in the brand colour
   claims that a brand-coloured thing is a successful thing, and leaves
   nothing to say success with on a screen where the accent is already on
   the button beside it.
3. **Tone is never the only signal.** Around one man in twelve cannot
   separate the red from the green, and nobody can in a printed
   black-and-white report. A chip carries its word; a callout carries a
   title.
4. **Every control is reachable from a keyboard and visibly focused.** One
   tab stop per tab strip with arrows inside it; a modal that traps focus
   and gives it back; a focus ring at 3:1 — which is why the light theme
   does not ring in Ignition, at 2.64:1.
5. **Money is an integer of cents.** `0.1 + 0.2` is
   `0.30000000000000004`. The component throws on a fractional cent rather
   than rendering something plausible and letting it travel further.
6. **Figures about the system are measured, not written down.**

## Component notes worth reading before copying one

**`Field` — the wiring is the component.** A `<label for>` pointing at the
control, `aria-describedby` carrying both the hint and the error, and
`aria-invalid` when it is wrong: five relationships between four generated
ids. Hand-wiring them is how forms end up with labels that do not focus
their input and errors a screen reader never announces. The error also does
not replace the hint — a field whose instruction disappears the moment it
is wrong has taken it away at the exact moment it was needed.

**`Tabs` — a tab strip is not a row of buttons.** Five buttons mean five
stops on the way past. The expected pattern is one stop for the whole
strip, with arrow keys moving inside it: a roving tabindex. Getting this
wrong is invisible to anybody using a mouse, which is why it survives in so
many component libraries.

**`Dialog` — five things, and most modals have two.** Focus moves in, focus
cannot leave, Escape closes, the page behind does not scroll, focus returns
to whatever opened it. The trap re-queries on every Tab rather than
capturing a list at mount, because a dialog's contents change and a stale
list goes wrong silently.

`<dialog>` with `showModal()` would give four of the five from the platform.
It is not used because the backdrop cannot be styled from the token layer
in every browser this has to run in, and a scrim that is the wrong colour
in one theme is exactly the failure this system exists to prevent. The
trade is forty lines, and it is written on the component so it can be
revisited.

**`DataTable` — four things tables get wrong.** No caption (a screen reader
announces "table, six columns" and nothing else), numbers in proportional
figures, an empty body where a header row over nothing reads as a broken
screen, and a sticky header with no scroll container to stick to.

**`Money` — not red by default.** A refund is negative and perfectly fine;
an overdraft is negative and is not. The component cannot tell which, so
the caller says.

---

## Layout

```
src/
  main.tsx          mounts App
  App.tsx           the three-position theme control and the four sections
  Foundations.tsx   colour, type, space
  Gallery.tsx       the components, working
  Audit.tsx         both palettes, measured in one document
  audit.ts          the pairs, the thresholds, the colour maths
  tokens.css        THE DESIGN SYSTEM. Everything else is an example.
  styles.css        the components and the documentation site
  components/       Button, Field, Feedback, Tabs, Dialog, DataTable, Money
```

**`tokens.css` is the product; `styles.css` is a consumer of it.** The
division is load-bearing: nothing in `styles.css` names a colour. Every
value is `var(--something)` from the layer above, which is the property
that makes the two themes one piece of work rather than two.

## Things worth knowing before changing it

**The theme control has three positions, not two.** "System" is the absence
of a choice and it is what most people are in. A two-position toggle has to
pick one of the two to mean "no preference", which silently overrides the
operating system for everybody who never touched it.

**`flex-basis` is the main axis, and the main axis changes.** The masthead
lede is `flex: 1 1 420px` in a row; the narrow breakpoint turns the row
into a column, at which point the same declaration asks for 420px of
*height*. It grew a blank third of a phone screen under three lines of
text. The breakpoint now resets it, and that is written on the rule.

**The audit measures once, on mount.** The tokens are static, so
re-measuring on every render would burn layout for an answer that cannot
have changed.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`,
with no server-side anything. The three typefaces are self-hosted in
`public/fonts/` under the SIL Open Font Licence, included alongside them.
