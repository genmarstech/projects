import { HERO_SHOT } from "../data";
import { c, font, stretch } from "../theme";

/**
 * 01 — the car, the headline, and the invitation to scroll.
 *
 * The three headline lines each sit inside their own `overflow: hidden`
 * wrapper and start translated 110% down. That mask is the whole reveal:
 * useScrollFx slides them back to 0 with a stagger once the loader lifts.
 * Remove the wrapper and the lines fade in from nothing instead of rising
 * out of the rule above them.
 */
export function Hero() {
  const line: React.CSSProperties = { display: "block" };
  return (
    <section
      id="top"
      data-sec="1"
      style={{ position: "relative", height: "100vh", minHeight: 620, overflow: "hidden" }}
    >
      <div data-hero-img style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        <img
          src={HERO_SHOT.src}
          alt={HERO_SHOT.alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 58%", display: "block" }}
        />
      </div>

      {/* A single band of light crossing the bodywork, on a long loop. */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          className="sweep"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "22%",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)",
          }}
        />
      </div>

      {/* Top scrim for the nav, bottom scrim into the marquee. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg,rgba(10,10,10,.55) 0%,transparent 30%,transparent 70%,#0a0a0a 100%)",
        }}
      />

      <div
        data-hero-title
        style={{
          position: "absolute",
          left: "clamp(20px,3vw,40px)",
          right: "clamp(20px,3vw,40px)",
          top: "clamp(96px,13vh,140px)",
          willChange: "transform",
        }}
      >
        <div
          style={{
            fontFamily: font.mono,
            fontSize: 12,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: c.red,
            marginBottom: 18,
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          <span style={{ width: 28, height: 1, background: c.red }} />
          Season 2026 · Concept SF-N
        </div>
        <h1
          style={{
            margin: 0,
            fontStretch: stretch.wide,
            fontWeight: 900,
            fontSize: "clamp(44px,7.4vw,150px)",
            lineHeight: 0.86,
            letterSpacing: "-.035em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ display: "block", overflow: "hidden" }}>
            <span data-line style={line}>Speed,</span>
          </span>
          <span style={{ display: "block", overflow: "hidden" }}>
            <span data-line style={line}>dressed in</span>
          </span>
          <span style={{ display: "block", overflow: "hidden" }}>
            <span data-line style={{ ...line, color: c.red, fontStyle: "italic" }}>black.</span>
          </span>
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          left: "clamp(20px,3vw,40px)",
          right: "clamp(20px,3vw,40px)",
          bottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <p data-reveal style={{ margin: 0, maxWidth: 360, fontSize: 15, lineHeight: 1.5, color: c.dim, textWrap: "pretty" }}>
          A study in carbon, restraint and a thousand horsepower. One car, one number, one colour held back until it
          matters.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: ".16em",
            textTransform: "uppercase",
          }}
        >
          <span>Scroll to ignite</span>
          <span style={{ position: "relative", width: 1, height: 56, background: "rgba(237,234,228,.2)", overflow: "hidden" }}>
            <span className="dropBar" style={{ position: "absolute", inset: 0, background: c.red }} />
          </span>
        </div>
      </div>
    </section>
  );
}
