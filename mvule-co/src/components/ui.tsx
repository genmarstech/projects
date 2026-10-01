import type { CSSProperties, ReactNode } from "react";

/**
 * The small pieces the design repeats.
 *
 * ── `<image-slot>` BECAME A PLAIN `<img>` ───────────────────────────────────
 *
 * Every picture in the design file is an `<image-slot>`: a custom element
 * from the design tool that renders a drop target, lets somebody drag a file
 * onto it, and persists the result to a sidecar JSON file beside the HTML.
 * Its own documentation says it is read-only outside that runtime — so on a
 * deployed site it is an `<img>` with extra steps.
 *
 * What is worth keeping is the `placeholder` text. In the design it tells an
 * editor what photograph belongs in the slot; here it becomes the `alt`,
 * which is the same sentence doing a more useful job. The `tone` stays as the
 * block colour behind the image, so a slow connection shows the right-coloured
 * rectangle rather than a white hole in a warm page.
 */
export function Shot({
  src,
  alt,
  tone,
  position = "50% 50%",
  loading = "lazy",
}: {
  src?: string;
  alt: string;
  tone: string;
  position?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: tone }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, display: "block" }}
        />
      ) : (
        // No photograph exists for this slot. The caption is shown rather
        // than a stock stand-in — see the craftsmen note in `data.ts`.
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 18,
            textAlign: "center",
            font: "400 13px/1.5 var(--f-body)",
            color: "rgba(34,29,24,.55)",
          }}
        >
          {alt}
        </span>
      )}
    </div>
  );
}

/** The pill button used for every filter, type and budget choice. */
export function Chip({
  label,
  on,
  onClick,
  swatch,
  small,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  swatch?: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      style={{
        height: small ? 38 : 44,
        padding: swatch ? "0 14px 0 8px" : small ? "0 14px" : "0 18px",
        borderRadius: 999,
        border: "1px solid",
        background: on ? "var(--c-ink)" : "transparent",
        color: on ? "var(--c-bg)" : "var(--c-ink)",
        borderColor: on ? "var(--c-ink)" : "var(--c-line)",
        font: `${small ? 500 : 500} ${small ? 13 : 14}px/1 var(--f-body)`,
        cursor: "pointer",
        transition: "background .25s, color .25s, border-color .25s",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      {swatch && (
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: swatch,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)",
          }}
        />
      )}
      {label}
    </button>
  );
}

/** Eyebrow + heading, the pattern every section opens with. */
export function SectionHead({
  eyebrow,
  title,
  children,
  size = "clamp(34px,6vw,60px)",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  size?: string;
}) {
  return (
    <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span
        style={{
          font: "600 12px/1 var(--f-body)",
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "var(--c-accent)",
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ margin: 0, font: `400 ${size}/1.02 var(--f-display)`, letterSpacing: "-.01em" }}>{title}</h2>
      {children}
    </div>
  );
}

/** Shared page padding — the design repeats this clamp on every section. */
export const GUTTER = "clamp(20px,5vw,56px)";
export const shell: CSSProperties = { maxWidth: 1280, margin: "0 auto", padding: `0 ${GUTTER}` };
