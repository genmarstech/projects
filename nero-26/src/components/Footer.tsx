import { DRIVER_SHOT, HERO_SHOT } from "../data";
import { c, font, stretch } from "../theme";
import type { StoreApi } from "../useStore";

const COLUMNS: [string, [string, string][]][] = [
  ["Team", [["#machine", "Machine"], ["#driver", "Driver"], ["#tyre", "Tyre lab"]]],
  ["Season", [["#calendar", "Calendar"], ["#paddock", "Paddock"]]],
  ["Follow", [["#top", "Instagram"], ["#top", "YouTube"], ["#top", "X"]]],
];

/**
 * The sign-off, and the giant word.
 *
 * ── THE DISCLAIMER IS LOAD-BEARING ──────────────────────────────────────────
 *
 * "Concept website · not affiliated with any team" is the only sentence on
 * the page that tells a reader none of this is real. Everything above it —
 * the livery names, the calendar of actual circuits, the telemetry — is
 * written to look like a team's own site, which is the point of the design
 * and exactly why the line has to stay.
 *
 * The form is a real form: it submits, it is prevented, and the button
 * becomes a confirmation. It goes nowhere, so it collects nothing and says
 * nothing about a list it is not adding you to.
 */
export function Footer({ store }: { store: StoreApi }) {
  return (
    <footer
      style={{
        position: "relative",
        padding: "100px clamp(20px,3vw,40px) 28px",
        borderTop: `1px solid ${c.line}`,
        overflow: "hidden",
        background: c.black,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
          gap: 40,
          marginBottom: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h3
            data-reveal
            style={{
              margin: 0,
              fontStretch: stretch.wide,
              fontWeight: 900,
              fontSize: "clamp(28px,3.4vw,56px)",
              lineHeight: 0.92,
              letterSpacing: "-.03em",
              textTransform: "uppercase",
            }}
          >
            Get the
            <br />
            pit wall feed.
          </h3>
          <form
            data-reveal
            onSubmit={(e) => {
              e.preventDefault();
              store.subscribe();
            }}
            style={{ display: "flex", borderBottom: `1px solid ${c.ink}`, maxWidth: 460 }}
          >
            <label htmlFor="nero-email" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              Email address
            </label>
            <input
              id="nero-email"
              type="email"
              required
              placeholder="you@domain.com"
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: 0,
                outline: 0,
                color: c.ink,
                fontFamily: font.mono,
                fontSize: 14,
                padding: "14px 0",
              }}
            />
            <button
              data-hover
              type="submit"
              style={{
                background: "transparent",
                border: 0,
                color: c.red,
                fontFamily: font.mono,
                fontSize: 12,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "0 0 0 16px",
                minHeight: 44,
              }}
            >
              {store.subscribed ? "On the grid ✓" : "Subscribe →"}
            </button>
          </form>
        </div>

        <div
          className="footerLinks"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,minmax(0,1fr))",
            gap: 20,
            fontFamily: font.mono,
            fontSize: 12,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {COLUMNS.map(([heading, links]) => (
            <div key={heading} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ color: c.fainter }}>{heading}</span>
              {links.map(([href, label]) => (
                <a key={label} href={href} data-hover>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        data-footer-word
        aria-hidden
        style={{
          fontStretch: stretch.wide,
          fontWeight: 900,
          fontSize: "27vw",
          lineHeight: 0.74,
          letterSpacing: "-.06em",
          textAlign: "center",
          margin: "0 -1vw",
          color: c.red,
          willChange: "transform",
        }}
      >
        NERO
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 28,
          fontFamily: font.mono,
          fontSize: 11,
          letterSpacing: ".1em",
          color: c.fainter,
          textTransform: "uppercase",
        }}
      >
        {/*
          The hero and the driver photographs fill a screen each and cannot
          carry a caption without sitting on the design, and neither appears
          in the lightbox that credits the gallery. Unsplash's licence still
          wants attribution, so it is printed here.
        */}
        <span>
          Concept website · not affiliated with any team · photography by{" "}
          <a href={HERO_SHOT.href} target="_blank" rel="noreferrer" style={{ color: c.faint }}>
            {HERO_SHOT.credit}
          </a>{" "}
          and{" "}
          <a href={DRIVER_SHOT.href} target="_blank" rel="noreferrer" style={{ color: c.faint }}>
            {DRIVER_SHOT.credit}
          </a>{" "}
          on Unsplash
        </span>
        <a href="#top" data-hover className="backToGrid" style={{ color: c.ink }}>
          Back to grid ↑
        </a>
      </div>
    </footer>
  );
}
