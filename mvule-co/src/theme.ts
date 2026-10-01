import { FONT_PAIRING, PALETTE } from "./config";

/**
 * Three palettes, three font pairings, and the one function that applies a
 * choice.
 *
 * ── EVERYTHING IS A CSS CUSTOM PROPERTY, AND THAT IS THE POINT ──────────────
 *
 * The design styles every element inline against `var(--c-ink)`,
 * `var(--f-display)` and the rest, then writes those variables onto the root
 * from JavaScript. That indirection is what makes the template rebrandable:
 * one call to `applyTheme` repaints the whole site, including the parts that
 * are inline styles and could not otherwise be reached by a stylesheet.
 *
 * So the rule here is the opposite of the other projects in this repository:
 * do NOT hard-code a hex in a component. Reach for a variable, or the
 * rebrand stops working.
 */

export interface Palette {
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  olive: string;
  wood: string;
}

export const PALETTES: Record<string, Palette> = {
  "Mvule terracotta": {
    bg: "#F5EFE6", surface: "#ECE1D0", ink: "#221D18", muted: "#6B5E50",
    accent: "#A64B27", olive: "#4A4E2E", wood: "#4A2616",
  },
  "Olive grove": {
    bg: "#F3F0E6", surface: "#E4E2D0", ink: "#1F221A", muted: "#5F6352",
    accent: "#5E6B34", olive: "#8A5A2B", wood: "#2F3320",
  },
  "Lamu indigo": {
    bg: "#F4F1EA", surface: "#E3E0D6", ink: "#1A1F2A", muted: "#5B6070",
    accent: "#2F4A7A", olive: "#8A5A2B", wood: "#1E2638",
  },
};

/** [display stack, body stack], and the Google Fonts families they need. */
export const FONT_PAIRINGS: Record<string, { display: string; body: string; families: string[] }> = {
  "Gloock + Hanken Grotesk": {
    display: "'Gloock', Georgia, serif",
    body: "'Hanken Grotesk', system-ui, sans-serif",
    families: ["Gloock", "Hanken+Grotesk:wght@400;500;600;700"],
  },
  "Cormorant + Karla": {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Karla', system-ui, sans-serif",
    families: ["Cormorant+Garamond:wght@500;600", "Karla:wght@400;500;600;700"],
  },
  "Young Serif + Figtree": {
    display: "'Young Serif', Georgia, serif",
    body: "'Figtree', system-ui, sans-serif",
    families: ["Young+Serif", "Figtree:wght@400;500;600;700"],
  },
};

/**
 * Fabric and finish colours, by name.
 *
 * These are product data, not brand: a Sand cushion stays sand whichever
 * palette the shop is wearing. They live here only because the swatch dots
 * and the colour filter both need them.
 */
export const SWATCHES: Record<string, string> = {
  Sand: "#D8C3A1",
  Terracotta: "#B35A35",
  Olive: "#5C6034",
  Charcoal: "#2E2A26",
  Cream: "#EFE6D6",
  Natural: "#B89468",
  Walnut: "#6B4128",
};

/** WhatsApp's own green, and the green M-Pesa uses. Neither is ours to theme. */
export const BRAND_GREEN = { whatsapp: "#25D366", whatsappInk: "#062B16", mpesa: "#1F7F3A" } as const;

const palette = () => PALETTES[PALETTE] ?? PALETTES["Mvule terracotta"]!;
const fonts = () => FONT_PAIRINGS[FONT_PAIRING] ?? FONT_PAIRINGS["Gloock + Hanken Grotesk"]!;

/**
 * Write the chosen palette and faces onto `:root`.
 *
 * Called once before the first render — not in an effect — because every
 * element on the page is styled against these variables, and a frame rendered
 * before they exist is a frame of black text on a transparent ground.
 */
export function applyTheme() {
  const p = palette();
  const f = fonts();
  const r = document.documentElement.style;
  (Object.keys(p) as (keyof Palette)[]).forEach((k) => r.setProperty(`--c-${k}`, p[k]));
  r.setProperty("--c-line", "rgba(34,29,24,.14)");
  r.setProperty("--f-display", f.display);
  r.setProperty("--f-body", f.body);
}

/**
 * The Google Fonts stylesheet for the active pairing only.
 *
 * Built here rather than hard-coded in index.html so there is one source of
 * truth: switching `FONT_PAIRING` cannot leave the page loading the previous
 * pair's files and rendering a fallback.
 */
export function fontHref() {
  const families = fonts().families.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
