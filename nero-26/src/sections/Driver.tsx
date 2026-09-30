import { DRIVER_QUOTE, DRIVER_STATS } from "../data";
import { c, ease, font, stretch } from "../theme";

/**
 * 04 — the helmet, opening.
 *
 * The reveal is a `clip-path: inset(...)` that starts at 22%/32% and eases to
 * zero, so the photograph widens out of a letterbox rather than fading in.
 * The image is scaled 1.35 underneath and eased back, which keeps the visor
 * roughly still while the frame around it grows — without that the whole
 * picture appears to rush at the reader.
 *
 * Un-pinned, `styles.css` drops the clip entirely and gives the stage a
 * fixed height: a 22% inset on a 380px-tall block crops the helmet to a
 * slot, and the point of the section is the helmet.
 */
export function Driver() {
  return (
    <section
      id="driver"
      className="pinSection"
      data-sec="4"
      data-pin="driver"
      style={{ position: "relative", height: "300vh", background: c.black }}
    >
      <div className="pinInner">
        <div
          className="helmetStage"
          data-helmet
          style={{ position: "absolute", inset: 0, clipPath: "inset(22% 32% 22% 32%)", willChange: "clip-path" }}
        >
          <img
            data-helmet-img
            src="assets/helmet.jpg"
            alt="The driver's helmet, visor closed"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 30%",
              display: "block",
              transform: "scale(1.35)",
              willChange: "transform",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg,rgba(10,10,10,.85) 0%,rgba(10,10,10,.1) 45%,transparent 60%,rgba(10,10,10,.6) 100%)",
            }}
          />
        </div>

        <div
          className="driverNum"
          data-num
          aria-hidden
          style={{
            position: "absolute",
            right: "clamp(10px,2vw,30px)",
            bottom: "-4vw",
            fontStretch: stretch.tight,
            fontWeight: 900,
            fontSize: "clamp(200px,38vw,640px)",
            lineHeight: 0.8,
            letterSpacing: "-.04em",
            color: "transparent",
            WebkitTextStroke: `2px ${c.ink}`,
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          16
        </div>

        <div
          className="pinAbs"
          data-driver-copy
          style={{
            position: "absolute",
            left: "clamp(20px,3vw,40px)",
            bottom: "clamp(40px,8vh,90px)",
            maxWidth: 560,
            display: "flex",
            flexDirection: "column",
            gap: 22,
            opacity: 0,
            transform: "translateY(40px)",
            transition: `opacity .8s, transform .8s ${ease.out}`,
          }}
        >
          <div style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".16em", color: c.red, textTransform: "uppercase" }}>
            04 — The driver
          </div>
          <blockquote
            style={{
              margin: 0,
              fontStretch: stretch.mid,
              fontWeight: 800,
              fontSize: "clamp(26px,3.2vw,50px)",
              lineHeight: 1.02,
              letterSpacing: "-.025em",
              textTransform: "uppercase",
              textWrap: "balance",
            }}
          >
            {DRIVER_QUOTE}
          </blockquote>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {DRIVER_STATS.map((d) => (
              <div key={d.l}>
                <div style={{ fontStretch: stretch.tight, fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{d.v}</div>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: 10,
                    letterSpacing: ".14em",
                    color: c.dimmer,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {d.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
