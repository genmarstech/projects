import { MARQUEE } from "../data";
import { c, stretch } from "../theme";

/**
 * The scrolling band of figures between the hero and the car.
 *
 * The list is rendered twice and the track animates to -50%, which is what
 * makes the loop seamless: at the halfway point the second copy sits exactly
 * where the first began. Change the duplication and the strip will jump.
 *
 * Aria-hidden, because it says the same six things over and over and a
 * screen reader would read both copies.
 */
export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div
      className="marquee"
      aria-hidden
      style={{
        borderTop: `1px solid ${c.line}`,
        borderBottom: `1px solid ${c.line}`,
        overflow: "hidden",
        background: c.black,
        padding: "22px 0",
      }}
    >
      <div className="marqueeTrack" style={{ display: "flex", width: "max-content" }}>
        {items.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              paddingRight: 36,
              fontStretch: stretch.wide,
              fontWeight: 900,
              fontSize: "clamp(28px,3.6vw,56px)",
              textTransform: "uppercase",
              letterSpacing: "-.02em",
              whiteSpace: "nowrap",
            }}
          >
            <span>{m.a}</span>
            <span style={{ color: "transparent", WebkitTextStroke: `1px ${c.ink}` }}>{m.b}</span>
            <span style={{ width: 14, height: 14, background: c.red, transform: "rotate(45deg)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
