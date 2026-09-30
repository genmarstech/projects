import { GALLERY, RACES, RACE_SHOT } from "../data";
import { c, font, stretch } from "../theme";

/**
 * 05 — the closing rounds.
 *
 * Hovering a row flies a photograph in beside the cursor. That is done by
 * writing to the one `RowPreview` node rather than mounting an image per
 * row, and the handlers here are the only place this section touches
 * anything outside itself.
 *
 * The rows are `<a href="#calendar">` in the design — links that go nowhere,
 * purely to get the hover and the pointer. Kept as anchors so the keyboard
 * can reach them and the preview fires on focus too, which it did not in the
 * design: a hover-only affordance is invisible to anyone not using a mouse.
 */
export function Calendar() {
  const show = (i: number) => {
    const pv = document.querySelector<HTMLElement>("[data-preview]");
    const img = document.querySelector<HTMLImageElement>("[data-preview-img]");
    if (!pv || !img) return;
    const shot = GALLERY[RACE_SHOT[i] ?? 0]!;
    img.src = shot.src;
    img.alt = "";
    pv.style.opacity = "1";
    // translateY(-50%) is the centring — see RowPreview. Dropping it here
    // sends the preview off the top of the screen while still "visible".
    pv.style.transform = "translateY(-50%) scale(1) rotate(-3deg)";
  };
  const hide = () => {
    const pv = document.querySelector<HTMLElement>("[data-preview]");
    if (!pv) return;
    pv.style.opacity = "0";
    pv.style.transform = "translateY(-50%) scale(.8) rotate(-4deg)";
  };

  return (
    <section
      id="calendar"
      data-sec="5"
      style={{ padding: "clamp(100px,14vh,160px) clamp(20px,3vw,40px) 100px", background: c.black }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
        <div>
          <div
            data-reveal
            style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".16em", color: c.red, textTransform: "uppercase", marginBottom: 14 }}
          >
            05 — Season 2026
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
            The run-in.
          </h2>
        </div>
        <p data-reveal style={{ margin: 0, maxWidth: 320, fontSize: 14, lineHeight: 1.55, color: c.muted }}>
          The closing stretch of the calendar, from the night streets of Marina Bay to the finale under Yas Marina's
          lights.
        </p>
      </div>

      <div onMouseLeave={hide} style={{ borderTop: `1px solid ${c.lineSoft}` }}>
        {RACES.map((r, i) => (
          <a
            key={r.round}
            href="#calendar"
            className="raceRow"
            data-hover
            data-reveal
            onMouseEnter={() => show(i)}
            onFocus={() => show(i)}
            onBlur={hide}
            style={{
              display: "grid",
              gridTemplateColumns: "64px minmax(0,1.3fr) minmax(0,1fr) 110px 40px",
              gap: 20,
              alignItems: "center",
              padding: "clamp(18px,2.4vw,30px) 12px",
              borderBottom: `1px solid ${c.lineSoft}`,
              color: c.ink,
            }}
          >
            <span style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".1em" }}>R{r.round}</span>
            <span
              style={{
                fontStretch: stretch.wide,
                fontWeight: 900,
                fontSize: "clamp(20px,3vw,48px)",
                letterSpacing: "-.03em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {r.city}
            </span>
            <span className="raceCircuit" style={{ fontSize: 14, opacity: 0.7 }}>
              {r.circuit}
            </span>
            <span style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".08em", textAlign: "right" }}>{r.len} KM</span>
            <span className="raceArrow" aria-hidden style={{ fontSize: 22, textAlign: "right" }}>
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
