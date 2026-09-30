/**
 * Every colour, face and easing the design uses, named once.
 *
 * The palette is four greys and one red. That is the whole point of the
 * design — the red is the only saturated thing on the page, so it reads as
 * signal wherever it appears: the accent rule, the hotspot pin, the rev
 * limiter, the row you are hovering. Introducing a second accent would spend
 * the one piece of emphasis the page has.
 */
export const c = {
  /** Page ground. Not #000 — a true black kills the carbon in the photographs. */
  black: "#0a0a0a",
  /** One step up, for panels that must separate from the ground. */
  panel: "#0d0d0d",
  /** Gallery tile ground, visible only while an image loads. */
  tile: "#141414",
  /** Hairlines. */
  line: "#1f1f1f",
  lineSoft: "#262626",
  lineHard: "#333333",
  /** Off-white body text. Warmer than #fff, which glares on this ground. */
  ink: "#edeae4",
  /** Muted copy, in descending order of presence. */
  dim: "#b9b5ae",
  dimmer: "#a9a59f",
  muted: "#9c9892",
  faint: "#8a8783",
  fainter: "#6b6864",
  /** The one accent. */
  red: "#e10600",
  /** Instrument colours on the rev bar — these are not brand, they are state. */
  amber: "#ffd12e",
  white: "#f2f2f2",
  green: "#3dbe5b",
  blue: "#2f7bff",
  /** Unlit rev bar segment and dormant countdown light. */
  off: "#1f1f1f",
  lightOff: "#1d1d1d",
} as const;

export const font = {
  /**
   * Archivo is a variable font with a width axis, and the design leans on it
   * hard: 62% for the instrument numerals so long figures stay narrow, 125%
   * for the headlines so they fill the measure. Losing the axis loses the
   * typography, so `font-stretch` is set explicitly everywhere it matters.
   */
  display: "'Archivo', system-ui, sans-serif",
  /** Labels, timings, anything that should read as telemetry. */
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Width axis values, so a `font-stretch` never appears as a bare number. */
export const stretch = {
  /** Condensed. Instrument read-outs and the driver's number. */
  tight: "62%",
  /** Slightly wide. Card titles. */
  mid: "110%",
  /** Wide. Headlines and the wordmark. */
  wide: "125%",
} as const;

export const ease = {
  /** The house curve: quick out, long settle. */
  out: "cubic-bezier(.2,.8,.2,1)",
  /** The loader's lift — slower to start, which reads as weight. */
  curtain: "cubic-bezier(.77,0,.18,1)",
  /** The hero's light sweep. */
  sweep: "cubic-bezier(.6,0,.2,1)",
} as const;

/** Where a `data-reveal` element sits before it comes in. */
export const revealFrom = "translateY(40px)";
