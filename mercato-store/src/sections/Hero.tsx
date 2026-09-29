import { useEffect } from "react";
import { c, ease, font, r } from "../theme";
import { BY, HERO, money, photo } from "../data";
import { HERO_AUTOPLAY } from "../config";
import type { StoreApi } from "../useStore";
import type { ScrollRefs } from "../useScrollFx";

/** How long each slide holds before the next one takes over. */
const AUTOPLAY_MS = 6500;

/**
 * Three slides stacked in one grid cell, cross-fading.
 *
 * All three are always in the DOM — that is what makes the fade possible, and
 * it is also why the two that are not showing take `pointer-events: none`.
 * Without it the invisible slide on top swallows the clicks meant for the
 * visible one, which is a bug you cannot see.
 *
 * The vertical word at the right edge is drawn twice: an outline pass and a
 * solid pass, offset by nothing. That is the design's device for giving a
 * 160px letterform weight without a drop shadow.
 */
export function Hero({ s, refs }: { s: StoreApi; refs: ScrollRefs }) {
  const slide = HERO[s.hero]!;
  const product = BY[slide.pid]!;

  useEffect(() => {
    if (!HERO_AUTOPLAY) return;
    // Rotating the hero underneath an open product sheet moves the page the
    // person stopped looking at, and changes what "Add to basket" adds.
    if (s.pid) return;
    const calm =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) return;

    const t = window.setInterval(
      () => s.setHero((prev) => (prev + 1) % HERO.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(t);
  }, [s.pid, s.setHero]);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: slide.bg,
        color: c.cream,
        transition: "background 1.1s ease",
      }}
    >
      <div
        ref={refs.heroVert}
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: "clamp(120px,14vw,230px)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      >
        {HERO.map((h, i) => (
          <div
            key={h.pid}
            style={{
              position: "absolute",
              right: 0,
              top: 24,
              display: "flex",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              opacity: i === s.hero ? 1 : 0,
              transition: "opacity .9s ease",
            }}
          >
            <span
              style={{
                fontFamily: font.display,
                fontSize: "clamp(70px,9.5vw,160px)",
                lineHeight: 0.92,
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(244,238,225,.4)",
                textTransform: "uppercase",
              }}
            >
              {h.vert}
            </span>
            <span
              style={{
                fontFamily: font.display,
                fontSize: "clamp(70px,9.5vw,160px)",
                lineHeight: 0.92,
                color: h.accent,
                textTransform: "uppercase",
              }}
            >
              {h.vert}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(40px,6vw,88px) clamp(16px,3vw,40px) clamp(40px,5vw,72px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <div
          ref={refs.heroText}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            willChange: "transform",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ display: "grid" }}>
            {HERO.map((h, i) => {
              const on = i === s.hero;
              return (
                <div
                  key={h.pid}
                  aria-hidden={!on}
                  style={{
                    gridArea: "1/1",
                    display: "flex",
                    flexDirection: "column",
                    gap: 22,
                    opacity: on ? 1 : 0,
                    transform: on ? "none" : "translateY(24px)",
                    pointerEvents: on ? "auto" : "none",
                    transition: `opacity .8s ease,transform 1s ${ease.travel}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        background: h.accent,
                        color: c.ink,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        padding: "6px 10px",
                        borderRadius: 4,
                      }}
                    >
                      {h.tag}
                    </span>
                    <span
                      style={{ fontFamily: font.word, fontStyle: "italic", fontSize: 24 }}
                    >
                      {h.kicker}
                    </span>
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontFamily: font.display,
                      fontWeight: 400,
                      textTransform: "uppercase",
                      fontSize: "clamp(60px,8.6vw,140px)",
                      lineHeight: 0.9,
                    }}
                  >
                    <span style={{ display: "block" }}>{h.l1}</span>
                    <span style={{ display: "block", color: h.accent }}>{h.l2}</span>
                    <span style={{ display: "block" }}>{h.l3}</span>
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      maxWidth: 440,
                      fontSize: 17,
                      lineHeight: 1.55,
                      color: c.onDark,
                      textWrap: "pretty",
                    }}
                  >
                    {h.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="lift"
              onClick={() => s.add(product.id)}
              style={{
                height: 58,
                padding: "0 26px",
                borderRadius: r.pill,
                border: 0,
                background: c.cream,
                color: c.ink,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "transform .25s",
              }}
            >
              <span>Add to basket</span>
              <span style={{ width: 1, height: 22, background: "rgba(20,32,27,.2)" }} />
              <span>{money(product.price)}</span>
            </button>
            <button
              type="button"
              className="ghostOnDark"
              onClick={() => s.openProduct(product.id)}
              style={{
                height: 58,
                padding: "0 24px",
                borderRadius: r.pill,
                border: "1.5px solid rgba(244,238,225,.5)",
                background: "transparent",
                color: c.cream,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              View details
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {HERO.map((h, i) => {
              const p = BY[h.pid]!;
              return (
                <button
                  key={h.pid}
                  type="button"
                  onClick={() => s.setHero(i)}
                  aria-pressed={i === s.hero}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(244,238,225,.08)",
                    border: `1.5px solid ${i === s.hero ? h.accent : "rgba(244,238,225,.18)"}`,
                    borderRadius: 16,
                    padding: "6px 14px 6px 6px",
                    cursor: "pointer",
                    color: c.cream,
                    transition: "border-color .4s",
                  }}
                >
                  <img
                    src={photo(p.img, 120)}
                    alt=""
                    style={{ width: 46, height: 46, borderRadius: 11, objectFit: "cover" }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: "left",
                      lineHeight: 1.2,
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 540,
            aspectRatio: "4/5",
            justifySelf: "center",
          }}
        >
          <div ref={refs.heroImg} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
            {HERO.map((h, i) => {
              const p = BY[h.pid]!;
              const on = i === s.hero;
              return (
                <div
                  key={h.pid}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: r.hero,
                    overflow: "hidden",
                    opacity: on ? 1 : 0,
                    transform: on ? "none" : "scale(.92) rotate(-5deg) translateY(30px)",
                    transition: `opacity 1s ease,transform 1.3s ${ease.travel}`,
                    boxShadow: "0 50px 90px -40px rgba(0,0,0,.65)",
                  }}
                >
                  <img
                    src={photo(p.img, 1100)}
                    alt={on ? p.name : ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              );
            })}
          </div>

          {/* The next free slot, computed from the same table the checkout books against. */}
          <div
            style={{
              position: "absolute",
              left: "clamp(-24px,-2vw,-8px)",
              bottom: 36,
              background: c.cream,
              color: c.ink,
              borderRadius: r.box,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 24px 40px -20px rgba(0,0,0,.5)",
            }}
          >
            <span style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: c.liveGreen,
                  animation: "mcPulse 1.8s infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: c.liveGreen,
                }}
              />
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: c.muted,
                }}
              >
                Next {s.mode === "Delivery" ? "delivery" : "pickup"} slot
              </span>
              <span
                style={{
                  fontFamily: font.display,
                  fontSize: 26,
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                Today, {s.nextSlot}
              </span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: -14,
              top: 28,
              width: 112,
              height: 112,
              borderRadius: "50%",
              background: c.tomato,
              color: c.onTomato,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              transform: "rotate(10deg)",
              boxShadow: "0 20px 40px -20px rgba(0,0,0,.5)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: font.display, fontSize: 30, lineHeight: 1 }}>
                {money(product.price)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                {product.unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
