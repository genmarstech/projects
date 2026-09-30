/**
 * The design file's editor props, as constants.
 *
 * ── WHY THESE ARE NOT PROPS ─────────────────────────────────────────────────
 *
 * `Nero 26.dc.html` exposed three knobs to a canvas — `showLoader`,
 * `customCursor` and `motion` — so somebody could drag a slider and watch the
 * page respond. There is no canvas here. A prop panel nobody can reach is a
 * control that only looks like one, so they are named constants instead, in
 * one file, with the reason each exists written beside it.
 */

/**
 * The countdown-lights loader, five reds and a 000→100 counter.
 *
 * Off makes the hero's title lines animate in immediately instead of waiting
 * on the loader to lift. Both paths are exercised — see `runLoader` in
 * `useScrollFx` — because a loader that is the only thing starting the intro
 * means turning it off leaves the headline invisible.
 */
export const SHOW_LOADER = true;

/**
 * The circle-and-dot cursor that inverts against the page.
 *
 * It is `mix-blend-mode: difference`, so it needs the real cursor hidden to
 * not read as two pointers. A touch device has no pointer to replace, and
 * `POINTER_QUERY` below is what decides at runtime rather than trusting this.
 */
export const CUSTOM_CURSOR = true;

/**
 * Multiplier on every scroll-driven translation: parallax, the background
 * word, the driver's number. 1 is the design's own tuning.
 *
 * It scales distance, never duration, so raising it does not make anything
 * faster — it makes things travel further for the same scroll. Reduced motion
 * takes this to 0 outright (see `useScrollFx`).
 */
export const MOTION = 1;

/**
 * A custom cursor only makes sense where there is a cursor to replace.
 *
 * `hover: hover` is the honest test: it asks whether the primary input can
 * rest over something without activating it, which a finger cannot. Checking
 * for a touch API instead would hide the cursor on a laptop with a
 * touchscreen, where the pointer very much exists.
 */
export const POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** Below this width the two pinned sections stop pinning. See `useScrollFx`. */
export const PIN_MIN_WIDTH = 860;

/** How long the loader holds before the lights go out, in milliseconds. */
export const LOADER_MS = 2200;
