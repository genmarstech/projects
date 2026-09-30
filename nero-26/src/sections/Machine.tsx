import { HOTSPOTS, LIVERIES } from "../data";
import { c, font, stretch } from "../theme";
import type { StoreApi } from "../useStore";

/**
 * 02 — the car, taken apart.
 *
 * ── PINNED, AND THEN NOT ────────────────────────────────────────────────────
 *
 * The section is 420vh tall with a sticky child, so four viewport-heights of
 * scrolling move a camera instead of the page. `useScrollFx` decides whether
 * that happens at all and writes `data-pinned` on the root; `styles.css` lays
 * out both states. Un-pinned, the stage becomes a fixed-height block and the
 * four callouts move from pins floating over the canvas into the list at the
 * bottom — the same four facts, in the one form that fits a phone.
 *
 * The telemetry is not decoration for its own sake: speed, gear and revs are
 * all derived from the same scroll position that drives the camera, so the
 * numbers and the picture can never disagree.
 */
export function Machine({ store }: { store: StoreApi }) {
  const monoLabel: React.CSSProperties = {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: ".14em",
    color: c.faint,
    textTransform: "uppercase",
  };
  const readout: React.CSSProperties = {
    fontStretch: stretch.tight,
    fontWeight: 800,
    fontSize: "clamp(36px,4vw,60px)",
    lineHeight: 1,
  };
  const cell: React.CSSProperties = { background: c.black, padding: "14px 18px" };

  return (
    <section
      id="machine"
      className="pinSection"
      data-sec="2"
      data-pin="machine"
      style={{ position: "relative", height: "420vh", background: c.black }}
    >
      <div className="pinInner" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Oversized stroked wordmark sliding the other way to the camera. */}
        <div
          className="bgText"
          data-bgtext
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            whiteSpace: "nowrap",
            fontStretch: stretch.wide,
            fontWeight: 900,
            fontSize: "clamp(140px,26vw,460px)",
            lineHeight: 1,
            letterSpacing: "-.04em",
            color: "transparent",
            WebkitTextStroke: "1px rgba(237,234,228,.09)",
            transform: "translateY(-58%)",
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          NERO — SF·N — NERO — SF·N
        </div>

        <div
          className="pinAbs"
          style={{
            position: "absolute",
            top: "clamp(84px,11vh,120px)",
            left: "clamp(20px,3vw,40px)",
            right: "clamp(20px,3vw,40px)",
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "flex-start",
            zIndex: 3,
          }}
        >
          <div>
            <div style={{ ...monoLabel, fontSize: 12, letterSpacing: ".16em", color: c.red, marginBottom: 12 }}>
              02 — The machine
            </div>
            <h2
              style={{
                margin: 0,
                fontStretch: stretch.wide,
                fontWeight: 900,
                fontSize: "clamp(30px,4vw,64px)",
                lineHeight: 0.9,
                letterSpacing: "-.03em",
                textTransform: "uppercase",
              }}
            >
              Every surface
              <br />
              earns its place.
            </h2>
          </div>
          <p style={{ margin: 0, maxWidth: 300, fontSize: 14, lineHeight: 1.55, color: c.muted, textWrap: "pretty" }}>
            Scroll to strip the car down. Four systems, one silhouette — tuned for ground effect and the 2026
            active-aero rules.
          </p>
        </div>

        {/* Livery picker */}
        <div
          className="pinAbs liveryRow"
          style={{
            position: "absolute",
            right: "clamp(20px,3vw,40px)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div style={{ ...monoLabel, marginBottom: 4 }}>Livery</div>
          {LIVERIES.map((lv, i) => (
            <button
              key={lv.name}
              data-hover
              className="liveryBtn"
              aria-pressed={store.livery === i}
              onClick={() => store.setLivery(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "none",
                border: 0,
                padding: "6px 0",
                minHeight: 44,
                cursor: "pointer",
                color: c.ink,
              }}
            >
              <span style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>
                {lv.name}
              </span>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${lv.a} 50%,${lv.b} 50%)`,
                  boxShadow: `0 0 0 2px ${c.black},0 0 0 ${store.livery === i ? "3px" : "0px"} ${c.ink}`,
                  transition: "box-shadow .3s",
                }}
              />
            </button>
          ))}
        </div>

        {/* The WebGL stage, with the projected callouts living on top of it. */}
        <div className="carStage" style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <div data-car-host style={{ position: "absolute", inset: 0 }} />
          {HOTSPOTS.map((h) => (
            <div
              key={h.n}
              className="hotSpot"
              data-hot={h.t}
              aria-hidden
              style={{ position: "absolute", left: 0, top: 0, opacity: 0, transition: "opacity .45s", willChange: "left, top" }}
            >
              <span
                style={{
                  position: "absolute",
                  left: -7,
                  top: -7,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: c.red,
                  boxShadow: "0 0 0 3px rgba(225,6,0,.25)",
                }}
              />
              <span
                className="pulseRing"
                style={{ position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: "50%", border: `1px solid ${c.red}` }}
              />
              <div
                data-hot-card
                style={{
                  position: "absolute",
                  bottom: 22,
                  width: "clamp(170px,16vw,230px)",
                  padding: "12px 14px",
                  background: "rgba(10,10,10,.82)",
                  backdropFilter: "blur(10px)",
                  borderTop: `2px solid ${c.red}`,
                }}
              >
                <div style={{ ...monoLabel, color: c.red, marginBottom: 6 }}>{h.n}</div>
                <div style={{ fontStretch: stretch.mid, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "-.01em", marginBottom: 4 }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: c.dimmer }}>{h.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry */}
        <div
          className="pinAbs"
          style={{
            position: "absolute",
            left: "clamp(20px,3vw,40px)",
            right: "clamp(20px,3vw,40px)",
            bottom: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 1,
            background: c.line,
            border: `1px solid ${c.line}`,
            zIndex: 3,
          }}
        >
          <div style={cell}>
            <div style={monoLabel}>Speed</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span data-speed style={{ ...readout, fontVariantNumeric: "tabular-nums" }}>0</span>
              <span style={{ fontFamily: font.mono, fontSize: 11, color: c.faint }}>KM/H</span>
            </div>
          </div>
          <div style={cell}>
            <div style={monoLabel}>Gear</div>
            <div data-gear style={{ ...readout, color: c.red }}>N</div>
          </div>
          <div style={{ ...cell, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
            <div style={{ ...monoLabel, display: "flex", justifyContent: "space-between" }}>
              <span>RPM</span>
              <span data-rpm>4 000</span>
            </div>
            <div style={{ display: "flex", gap: 3, height: 18 }}>
              {Array.from({ length: 15 }, (_, i) => (
                <span key={i} data-rpmbar={i} style={{ flex: 1, background: c.off, transition: "background .1s" }} />
              ))}
            </div>
          </div>
          <div style={cell}>
            <div style={monoLabel}>Power unit</div>
            <div style={readout}>
              1.6<span style={{ fontSize: ".5em", color: c.faint }}> V6 · 50/50</span>
            </div>
          </div>
        </div>
      </div>

      {/*
        The same four callouts, for when the section is not pinned. Hidden by
        default in CSS and shown under `[data-pinned="off"]` — not a fallback
        so much as the other half of the design.
      */}
      <div className="hotList">
        {HOTSPOTS.map((h) => (
          <div key={h.n} style={{ background: c.black, padding: "16px 18px" }}>
            <div style={{ ...monoLabel, color: c.red, marginBottom: 6 }}>{h.n}</div>
            <div style={{ fontStretch: stretch.mid, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "-.01em", marginBottom: 4 }}>
              {h.title}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: c.dimmer }}>{h.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
