import type { CSSProperties, ReactNode } from "react";
import { c, colHead, r } from "../theme";

/**
 * The pieces the design repeats across screens.
 *
 * Pulled out only where a shape appears three or more times — a status chip
 * is in every table, a card wraps every panel. Anything used once stays
 * inline in its screen, where it can be read against the design file.
 */

/** A rounded status/segment chip. Colours always come from the data. */
export function Chip({
  children, bg, fg, style,
}: { children: ReactNode; bg: string; fg: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontSize: 12, fontWeight: 800, padding: "5px 10px",
        borderRadius: r.pill, background: bg, color: fg,
        whiteSpace: "nowrap", ...style,
      }}
    >
      {children}
    </span>
  );
}

/** A cream panel with a hairline border — the default surface for content. */
export function Card({
  children, style,
}: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section
      style={{
        background: c.panel, border: `1px solid ${c.lineCard}`,
        borderRadius: r.card, padding: 24,
        display: "flex", flexDirection: "column", gap: 6, ...style,
      }}
    >
      {children}
    </section>
  );
}

/** A filter tab. `count` is optional — the inventory and order tabs use it. */
export function Tab({
  label, active, onClick, count,
}: { label: string; active: boolean; onClick: () => void; count?: number | string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        height: 40, padding: "0 16px", borderRadius: r.pill,
        border: `1.5px solid ${c.ink}`,
        background: active ? c.ink : "transparent",
        color: active ? c.cream : c.ink,
        fontWeight: 700, fontSize: 13, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
      }}
    >
      {label}
      {count !== undefined && count !== "" ? (
        <span style={{ fontSize: 12, opacity: 0.7 }}>{count}</span>
      ) : null}
    </button>
  );
}

/** The small pill toggle used for listed-products and promotions. */
export function Switch({
  on, onClick, label,
}: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      style={{
        width: 44, height: 26, borderRadius: r.pill, border: 0,
        background: on ? c.forest : c.off,
        position: "relative", cursor: "pointer",
        transition: "background .25s", flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute", top: 3, left: on ? 21 : 3,
          width: 20, height: 20, borderRadius: "50%",
          background: c.white, transition: "left .25s",
        }}
      />
    </button>
  );
}

/** A thin progress meter. Used for stock, promo caps and the pipeline. */
export function Meter({
  pct, color, track = c.track, height = 6,
}: { pct: string; color: string; track?: string; height?: number }) {
  return (
    <div
      style={{
        height, borderRadius: height, background: track, overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%", width: pct, background: color,
          transition: "width .5s",
        }}
      />
    </div>
  );
}

/** A circular initials badge. */
export function Avatar({
  children, bg = c.lineCard, size = 38, color = c.ink,
}: { children: ReactNode; bg?: string; size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: "50%", background: bg,
        color, display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: size < 40 ? 12 : 13, flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

/** A table header row. `cols` is the grid template the body rows reuse. */
export function TableHead({ cols, labels }: { cols: string; labels: string[] }) {
  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: cols, gap: 12,
        padding: "14px 20px", borderBottom: `1px solid ${c.line}`,
        ...colHead,
      }}
    >
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

/**
 * A table's scroll container.
 *
 * `minWidth` rather than a responsive re-layout: these tables have eight
 * columns of genuinely tabular data, and stacking them into cards on a
 * phone makes them unreadable in a different way. Scrolling sideways is
 * honest about what they are.
 */
export function Scroller({
  minWidth, children,
}: { minWidth: number; children: ReactNode }) {
  return (
    <div
      style={{
        background: c.panel, border: `1px solid ${c.lineCard}`,
        borderRadius: r.card, overflow: "auto",
      }}
    >
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

/** A large Anton numeral — the design's signature for any figure that matters. */
export function Figure({
  children, size = 48, style,
}: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: "Anton, sans-serif", fontSize: size,
        lineHeight: 1, ...style,
      }}
    >
      {children}
    </span>
  );
}
