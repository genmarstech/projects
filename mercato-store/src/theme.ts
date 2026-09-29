/**
 * Mercato's palette — the same one the operations dashboard uses, because it
 * is the same shop.
 *
 * Every hex here appears in `Mercato Grocery.dc.html`. They are named tokens
 * rather than inline literals so a colour used in twenty places is one value.
 * The storefront uses a subset of the admin's set plus a few it does not
 * have: the card grounds the produce photography sits on.
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
  lineCard: "#E5DCC8",
  lineInput: "#D8CDB6",
  track: "#E2D9C4",
  off: "#C9BFA9",

  /* on dark grounds */
  onDark: "#E6E0D2",
  onForestSoft: "#CFC8B8",
  onInkSoft: "#9FA9A3",
  onTomato: "#FFF7EE",

  /* semantics */
  good: "#2E7D4F",
  bad: "#C7372A",
  liveGreen: "#2E9E5B",
  dietBg: "#DCE8DA",
  dietFg: "#1F4D33",
  pickedBg: "#EAF1E6",
  fullBg: "#EFE9DC",
} as const;

export const font = {
  /** Headings and every large numeral. */
  display: "Anton, sans-serif",
  /** The wordmark, the kickers and the one-word emphasis inside a heading. */
  word: "'Instrument Serif', serif",
  body: "Manrope, system-ui, sans-serif",
} as const;

/** Radii the design reuses. */
export const r = { hero: 36, modal: 32, card: 24, tile: 28, box: 18, img: 16, field: 14, small: 10, pill: 999 } as const;

/**
 * The two easings the design uses, and nothing else. The long one is for
 * anything that travels — a drawer, a card, a parallax layer; the short one
 * is for a colour or an opacity that has no distance to cover.
 */
export const ease = {
  travel: "cubic-bezier(.2,.7,.2,1)",
  drawer: "cubic-bezier(.2,.8,.2,1)",
} as const;

/** The reveal-on-scroll resting state. `useReveal` clears it. */
export const revealFrom = {
  opacity: 0,
  transform: "translateY(40px)",
  transition: `opacity .9s ease,transform .9s ${ease.travel}`,
} as const;
