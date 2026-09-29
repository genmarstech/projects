import { c, font } from "../theme";
import { roundMoney } from "../data";
import { FREE_DELIVERY_THRESHOLD } from "../config";

/**
 * The six claims the shop makes about itself, scrolling.
 *
 * The strip holds the list twice and translates by exactly half its own
 * width, which is what makes the loop seamless — at the end of the animation
 * copy two sits where copy one started, and the jump back to zero is
 * invisible. Changing the word list needs no other change; changing the
 * duplication would.
 *
 * Every line has to be true — a marquee is the easiest place on a site to put
 * a claim nobody checked.
 */
const WORDS = [
  "Picked this morning",
  `Free delivery over ${roundMoney(FREE_DELIVERY_THRESHOLD)}`,
  "40+ local growers",
  "Baked at 5am",
  "2-hour delivery windows",
  "Click & collect in 1 hour",
];

export function Marquee() {
  return (
    <div
      className="marquee"
      aria-hidden="true"
      style={{ background: c.tomato, color: c.onTomato, overflow: "hidden", padding: "16px 0" }}
    >
      <div
        className="marqueeTrack"
        style={{ display: "flex", width: "max-content", animation: "mcMarquee 36s linear infinite" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} style={{ display: "flex", gap: 40, paddingRight: 40 }}>
            {WORDS.map((w) => (
              <span
                key={w}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 40,
                  fontFamily: font.display,
                  fontSize: 30,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  letterSpacing: ".01em",
                }}
              >
                {w}
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c.amber,
                    display: "inline-block",
                  }}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
