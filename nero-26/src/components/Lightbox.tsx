import { useEffect, useRef } from "react";
import { GALLERY } from "../data";
import { c, font } from "../theme";
import type { StoreApi } from "../useStore";

/**
 * The paddock gallery, full screen.
 *
 * Keyboard handling lives in `useStore` alongside the index it moves, not
 * here — the listener has to be bound while this is open, and binding it in
 * the component that only exists while it is open would be the same thing
 * written twice.
 *
 * The credit is a link and it is not optional. Unsplash's licence asks for
 * attribution beside the photograph, and every remote shot in `data.ts`
 * carries the photographer and their profile.
 */
export function Lightbox({ store }: { store: StoreApi }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = store.lightbox >= 0;
  const shot = GALLERY[Math.max(0, store.lightbox)]!;

  // Focus lands on the close button, so the first Tab is inside the dialog
  // and Escape is not the only way out for somebody on a keyboard.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const round: React.CSSProperties = {
    flex: "none",
    background: "transparent",
    border: `1px solid ${c.lineHard}`,
    color: c.ink,
    borderRadius: "50%",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${shot.n} — ${shot.title}`}
      onClick={store.closeLightbox}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 95,
        background: "rgba(6,6,6,.96)",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(16px,3vw,40px)",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          fontFamily: font.mono,
          fontSize: 12,
          letterSpacing: ".14em",
          textTransform: "uppercase",
        }}
      >
        <span>
          <span style={{ color: c.red }}>{shot.n}</span> — {shot.title}
        </span>
        <button
          ref={closeRef}
          data-hover
          className="ghostBtn"
          onClick={store.closeLightbox}
          aria-label="Close"
          style={{ ...round, width: 48, height: 48, fontSize: 18 }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          data-hover
          className="ghostBtn"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            store.stepLightbox(-1);
          }}
          style={{ ...round, width: 56, height: 56, fontSize: 20 }}
        >
          ←
        </button>
        <img
          src={shot.src}
          alt={shot.alt}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "min(100%,1400px)",
            maxHeight: "100%",
            objectFit: "contain",
            display: "block",
            boxShadow: "0 40px 120px rgba(0,0,0,.7)",
          }}
        />
        <button
          data-hover
          className="ghostBtn"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            store.stepLightbox(1);
          }}
          style={{ ...round, width: 56, height: 56, fontSize: 20 }}
        >
          →
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          fontFamily: font.mono,
          fontSize: 11,
          letterSpacing: ".1em",
          color: c.faint,
          textTransform: "uppercase",
        }}
      >
        {shot.href ? (
          <a href={shot.href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: c.faint }}>
            {shot.credit}
          </a>
        ) : (
          <span>{shot.credit}</span>
        )}
        <span>
          {String(store.lightbox + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")} · ← → · Esc
        </span>
      </div>
    </div>
  );
}
