import { GALLERY } from "../data";
import { c, font, stretch } from "../theme";
import type { StoreApi } from "../useStore";

/**
 * 06 — the gallery.
 *
 * Each tile carries its own `grid-column`/`grid-row` span, which is what
 * makes the mosaic. Those spans are inline because they are data, one per
 * shot; the two breakpoints that rework them live in `styles.css`, because a
 * 12-column grid at 1400px and at 400px are different layouts rather than
 * the same one scaled.
 *
 * The tiles are buttons, not divs with click handlers. They open a modal, so
 * they have to be reachable and operable from a keyboard — and the caption
 * that appears on hover appears on focus too.
 */
export function Paddock({ store }: { store: StoreApi }) {
  return (
    <section id="paddock" data-sec="6" style={{ padding: "40px clamp(20px,3vw,40px) 120px", background: c.black }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 40 }}>
        <div>
          <div
            data-reveal
            style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".16em", color: c.red, textTransform: "uppercase", marginBottom: 14 }}
          >
            06 — Paddock
          </div>
          <h2
            data-reveal
            style={{
              margin: 0,
              fontStretch: stretch.wide,
              fontWeight: 900,
              fontSize: "clamp(36px,5vw,84px)",
              lineHeight: 0.88,
              letterSpacing: "-.035em",
              textTransform: "uppercase",
            }}
          >
            Off the grid.
          </h2>
        </div>
      </div>

      <div
        className="shotGrid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12,minmax(0,1fr))",
          gridAutoRows: "clamp(110px,14vw,220px)",
          gap: 12,
        }}
      >
        {GALLERY.map((g, i) => (
          <button
            key={g.n}
            className="shot"
            data-reveal
            data-hover
            onClick={() => store.openLightbox(i)}
            aria-label={`Open ${g.title}`}
            style={{
              gridColumn: g.col,
              gridRow: g.row,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              background: c.tile,
              border: 0,
              padding: 0,
              color: c.ink,
              textAlign: "left",
            }}
          >
            <img
              data-par="0.06"
              src={g.src}
              alt={g.alt}
              loading="lazy"
              style={{
                position: "absolute",
                inset: "-8% 0",
                width: "100%",
                height: "116%",
                objectFit: "cover",
                objectPosition: g.pos,
              }}
            />
            <div
              className="shotOverlay"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "16px 18px",
                background: "linear-gradient(0deg,rgba(10,10,10,.85),transparent 55%)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                <div>
                  <div
                    style={{
                      fontFamily: font.mono,
                      fontSize: 10,
                      letterSpacing: ".14em",
                      color: c.red,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {g.n}
                  </div>
                  <div
                    style={{
                      fontStretch: stretch.mid,
                      fontWeight: 800,
                      fontSize: "clamp(14px,1.4vw,20px)",
                      textTransform: "uppercase",
                      letterSpacing: "-.01em",
                    }}
                  >
                    {g.title}
                  </div>
                </div>
                <span
                  aria-hidden
                  style={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: "50%",
                    background: c.red,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#fff",
                  }}
                >
                  +
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
