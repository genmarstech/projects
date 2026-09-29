/**
 * Mercato's palette, taken from the design rather than approximated.
 *
 * Every hex here appears in `Mercato Admin.dc.html`. They are exported as
 * named tokens instead of being pasted into components so that a colour used
 * in six places is one value — the source had them inline, which is fine for
 * a design file and is how a palette drifts in a codebase.
 */
export const c = {
  /* grounds */
  cream: "#F4EEE1",
  panel: "#FBF8F1",
  white: "#FFFFFF",

  /* ink */
  ink: "#14201B",
  inkSoft: "#3E4A44",
  muted: "#5B6660",
  faint: "#8A7F6A",

  /* brand */
  forest: "#0E3B2E",
  tomato: "#E2412F",
  amber: "#F2B135",

  /* lines */
  line: "#E0D6C1",
  lineSoft: "#EAE2D0",
  lineCard: "#E5DCC8",
  lineInput: "#D8CDB6",
  track: "#E2D9C4",
  off: "#C9BFA9",

  /* on-forest */
  onForestSoft: "#CFC8B8",
  onTomato: "#FFF7EE",

  /* status fills, straight from the SC map in the design */
  newBg: "#F9DFA8",
  newFg: "#6B4A00",
  pickBg: "#DCE8DA",
  pickFg: "#1F4D33",
  packBg: "#D6E4F0",
  packFg: "#1E3F5E",
  doneBg: "#E6E1D3",
  doneFg: "#3E4A44",
  cancelBg: "#F3D3C8",
  cancelFg: "#8E2A1D",

  /* stock meters */
  good: "#2E7D4F",
  warn: "#E0A020",
  bad: "#E2412F",
  badDeep: "#C7372A",
  fullBg: "#FCE9E3",
  fullBorder: "#F0B8A8",
  liveGreen: "#2E9E5B",
  rowNew: "#FFF9EA",
} as const;

export const font = {
  /** Headings and every large numeral. */
  display: "Anton, sans-serif",
  /** The wordmark, and nothing else. */
  word: "'Instrument Serif', serif",
  body: "Manrope, system-ui, sans-serif",
} as const;

/** Radii the design reuses: cards, panels, pills. */
export const r = { card: 24, panel: 20, box: 18, field: 12, small: 10, pill: 999 } as const;

/** Small uppercase label, used a dozen times in the design. */
export const eyebrow = {
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: c.muted,
} as const;

/** Column-header variant of the same: slightly smaller, tighter tracking. */
export const colHead = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: c.muted,
} as const;
