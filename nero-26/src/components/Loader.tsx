import { c, ease, font, stretch } from "../theme";

/**
 * The formation-lap loader: five lights, a counter, a progress rule.
 *
 * It is `aria-hidden` and not focusable. It carries no information a screen
 * reader needs — the page underneath is already in the accessibility tree —
 * and announcing "000, 001, 002…" sixty times a second would be hostile.
 *
 * Everything that animates is driven from useScrollFx: the counter, the bar,
 * which lights are lit, and the lift at the end. The markup only has to be
 * findable, which is what the data attributes are for.
 */
export function Loader() {
  const label: React.CSSProperties = {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: c.faint,
  };

  return (
    <div
      data-loader
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: c.black,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px clamp(20px,3vw,40px)",
        transition: `transform 1.1s ${ease.curtain}`,
      }}
    >
      <div style={{ ...label, display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span>Scuderia Nero — Concept</span>
        <span>Formation lap</span>
      </div>

      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            data-light
            style={{
              width: "clamp(28px,4vw,56px)",
              height: "clamp(28px,4vw,56px)",
              borderRadius: "50%",
              background: c.lightOff,
              boxShadow: "inset 0 0 0 1px #2a2a2a",
              transition: "background .15s, box-shadow .15s",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div
          data-count
          style={{
            fontStretch: stretch.tight,
            fontWeight: 800,
            fontSize: "clamp(72px,14vw,220px)",
            lineHeight: 0.8,
            letterSpacing: "-.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          000
        </div>
        <div style={{ ...label, textAlign: "right" }}>
          Lights out
          <br />
          and away we go
        </div>
      </div>

      <div data-lbar style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: 0, background: c.red }} />
    </div>
  );
}
