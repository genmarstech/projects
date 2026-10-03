/**
 * Contrast, measured off what the browser actually paints.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE NUMBERS ON THE PAGE ARE NOT A TABLE SOMEBODY MAINTAINS.
 *
 * A design system that documents its contrast ratios in a markdown file
 * documents the ratios it had on the day somebody wrote them down. The
 * colours move; the file does not; and the file is now a claim about
 * accessibility that is quietly false.
 *
 * So each pair below is measured at runtime: a probe element is given
 * `color: var(--x); background: var(--y)`, the computed values are read
 * back as resolved `rgb()` — which is the only form a custom property is
 * guaranteed to have reached by then — and the ratio is computed from
 * those. If somebody changes a token and breaks a pair, this page says so
 * the next time it loads.
 *
 * ⚠ IT MEASURES BOTH THEMES AT ONCE, IN ONE DOCUMENT. The probes live
 *   inside scopes stamped `data-theme="light"` and `data-theme="dark"`,
 *   which is the reason the token layer assigns every dark value under the
 *   attribute as well as inside the media query. Auditing only the theme
 *   the reader happens to be in is auditing half of it.
 * ══════════════════════════════════════════════════════════════════════════
 */

export type Pair = {
  label: string;
  /** Custom property holding the foreground. */
  fg: string;
  /** Custom property holding the ground it sits on. */
  bg: string;
  /**
   * 4.5 for body text, 3 for large text and for the boundary of a control
   * — WCAG 2.2 success criteria 1.4.3 and 1.4.11. The threshold is part of
   * the pair because "does it pass" has no answer without it.
   */
  need: 3 | 4.5;
  use: string;
};

export const PAIRS: Pair[] = [
  { label: "ink on bg", fg: "--ink", bg: "--bg", need: 4.5, use: "body copy on the page" },
  { label: "ink on bg-raised", fg: "--ink", bg: "--bg-raised", need: 4.5, use: "body copy on a card" },
  { label: "ink on bg-sunken", fg: "--ink", bg: "--bg-sunken", need: 4.5, use: "body copy in a well" },
  { label: "ink-muted on bg", fg: "--ink-muted", bg: "--bg", need: 4.5, use: "secondary prose" },
  { label: "ink-muted on bg-raised", fg: "--ink-muted", bg: "--bg-raised", need: 4.5, use: "secondary prose on a card" },
  { label: "ink-faint on bg", fg: "--ink-faint", bg: "--bg", need: 4.5, use: "labels, metadata, captions" },
  { label: "ink-faint on bg-raised", fg: "--ink-faint", bg: "--bg-raised", need: 4.5, use: "the tightest pair in the system" },
  { label: "accent-text on bg", fg: "--accent-text", bg: "--bg", need: 4.5, use: "a link, or the accent as words" },
  { label: "accent-ink on accent", fg: "--accent-ink", bg: "--accent", need: 4.5, use: "the primary button" },
  { label: "focus on bg", fg: "--focus", bg: "--bg", need: 3, use: "the focus ring" },
  { label: "rule-strong on bg", fg: "--rule-strong", bg: "--bg", need: 3, use: "the border of an input" },
  { label: "good on its wash", fg: "--good", bg: "--good-wash", need: 4.5, use: "a success chip" },
  { label: "warn on its wash", fg: "--warn", bg: "--warn-wash", need: 4.5, use: "a warning chip" },
  { label: "bad on its wash", fg: "--bad", bg: "--bad-wash", need: 4.5, use: "an error chip" },
  { label: "info on its wash", fg: "--info", bg: "--info-wash", need: 4.5, use: "an information chip" },
];

export type Reading = Pair & { ratio: number; pass: boolean; fgHex: string; bgHex: string };

type Rgba = [number, number, number, number];

/** `rgb(r g b / a)` and `rgba(r, g, b, a)` are both what browsers return. */
const parse = (value: string): Rgba | null => {
  const nums = value.match(/[\d.]+%?/g);
  if (!nums || nums.length < 3) return null;
  const n = (s: string) => (s.endsWith("%") ? (parseFloat(s) * 255) / 100 : parseFloat(s));
  return [n(nums[0]), n(nums[1]), n(nums[2]), nums[3] !== undefined ? parseFloat(nums[3]) : 1];
};

/**
 * Flatten a translucent colour onto what is behind it.
 *
 * The washes are `rgba(…, 0.11)` on purpose — a solid tint would need a
 * second token per theme and would stop tracking the ground it sits on.
 * But a ratio against a translucent colour is meaningless, so the audit
 * does what the compositor does before it measures.
 */
const flatten = (top: Rgba, under: Rgba): Rgba => [
  top[0] * top[3] + under[0] * (1 - top[3]),
  top[1] * top[3] + under[1] * (1 - top[3]),
  top[2] * top[3] + under[2] * (1 - top[3]),
  1,
];

const luminance = ([r, g, b]: Rgba): number => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export const contrast = (a: Rgba, b: Rgba): number => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const hex = ([r, g, b]: Rgba): string =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

/**
 * Measure every pair inside one themed scope.
 *
 * `scope` must be an element carrying the theme — the probe is appended to
 * it so the custom properties it inherits are that theme's.
 */
export const measure = (scope: HTMLElement): Reading[] => {
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  scope.appendChild(probe);

  // The ground a wash sits on, so a translucent tint can be flattened.
  probe.style.color = "var(--bg-raised)";
  const pageGround = parse(getComputedStyle(probe).color) ?? [255, 255, 255, 1];

  const readings = PAIRS.map((pair) => {
    probe.style.color = `var(${pair.fg})`;
    probe.style.backgroundColor = `var(${pair.bg})`;
    const style = getComputedStyle(probe);

    const rawFg = parse(style.color) ?? [0, 0, 0, 1];
    const rawBg = parse(style.backgroundColor) ?? [255, 255, 255, 1];

    const bg = rawBg[3] < 1 ? flatten(rawBg, pageGround) : rawBg;
    const fg = rawFg[3] < 1 ? flatten(rawFg, bg) : rawFg;

    const ratio = contrast(fg, bg);
    return { ...pair, ratio, pass: ratio >= pair.need, fgHex: hex(fg), bgHex: hex(bg) };
  });

  scope.removeChild(probe);
  return readings;
};
