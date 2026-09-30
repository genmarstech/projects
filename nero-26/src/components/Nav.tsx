import { TOTAL_LAPS } from "../data";
import { c, font, stretch } from "../theme";

const LINKS = [
  ["#machine", "Machine"],
  ["#tyre", "Tyre lab"],
  ["#driver", "Driver"],
  ["#calendar", "Season"],
] as const;

/**
 * The fixed bar, and the reading rule above it.
 *
 * `mix-blend-mode: difference` again: the nav crosses a white-hot hero
 * photograph, a black section and a red footer word, and inverting is the
 * only treatment that stays legible over all three without a scrim. It is
 * also why every colour in here is `#fff` rather than the page's off-white —
 * difference blending wants a true white to invert to a true black.
 */
export function Nav() {
  return (
    <>
      <div data-progress style={{ position: "fixed", left: 0, top: 0, height: 2, width: 0, background: c.red, zIndex: 80 }} />
      <nav
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          zIndex: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "22px clamp(20px,3vw,40px)",
          mixBlendMode: "difference",
          color: "#fff",
        }}
      >
        <a href="#top" data-hover style={{ display: "flex", alignItems: "baseline", gap: 8, color: "#fff" }}>
          <span style={{ fontStretch: stretch.wide, fontWeight: 900, fontSize: 20, letterSpacing: "-.01em" }}>NERO</span>
          <span style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: ".1em" }}>/26</span>
        </a>

        <div
          className="navLinks"
          style={{
            display: "flex",
            gap: "clamp(14px,2.4vw,36px)",
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} data-hover style={{ color: "#fff" }}>
              {label}
            </a>
          ))}
        </div>

        <div
          className="navLaps"
          style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: ".14em", display: "flex", gap: 10, alignItems: "center" }}
        >
          <span className="blink" style={{ width: 6, height: 6, borderRadius: "50%", background: c.red }} />
          <span>
            LAP <span data-lap>01</span> / {String(TOTAL_LAPS).padStart(2, "0")}
          </span>
        </div>
      </nav>
    </>
  );
}
