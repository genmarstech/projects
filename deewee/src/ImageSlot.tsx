import type { CSSProperties } from "react";

/**
 * A stand-in for the original design's `<image-slot>` custom element.
 *
 * The real one is Claude Design's own authoring-time component — it lets
 * somebody drag a replacement photo onto the page inside the editor. That
 * machinery has nothing to render once the page is a deployed site, so this
 * keeps only the part that matters here: an image filling its container,
 * with an optional Unsplash credit line.
 */
export function ImageSlot({
  src,
  alt,
  shape = "rounded",
  radius = 12,
  fit = "cover",
  credit,
  creditHref,
}: {
  src: string;
  alt: string;
  shape?: "rect" | "rounded" | "circle";
  radius?: number;
  fit?: "cover" | "contain";
  credit?: string;
  creditHref?: string;
}) {
  const borderRadius = shape === "circle" ? "50%" : shape === "rounded" ? radius : 0;

  const wrap: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius,
    overflow: "hidden",
  };

  return (
    <div style={wrap}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }}
      />
      {credit ? (
        <a
          href={creditHref}
          target="_blank"
          rel="noreferrer"
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            background: "rgba(21,17,11,.72)",
            color: "#f6efe2",
            fontSize: 10,
            letterSpacing: ".02em",
            padding: "4px 8px",
            borderRadius: 999,
            textDecoration: "none",
          }}
        >
          {credit}
        </a>
      ) : null}
    </div>
  );
}
