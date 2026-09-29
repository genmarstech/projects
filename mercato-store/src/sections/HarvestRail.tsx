import { c, ease, font, r } from "../theme";
import { BY, RAIL, money, photo } from "../data";
import { PINNED_RAIL } from "../config";
import { SectionHeading, Stepper, saveBadge } from "../components/ui";
import type { StoreApi } from "../useStore";
import type { ScrollRefs } from "../useScrollFx";

/**
 * Eight cards that travel sideways as the page scrolls down.
 *
 * The geometry is all in `useScrollFx` — this file only supplies the nodes
 * and the refs it writes to. Two things here exist for its benefit and look
 * odd without it: `railOuter` has no height of its own (the hook sets one
 * equal to a viewport plus the track's overflow) and `railTrack` is
 * `width: max-content` so the overflow is real and measurable.
 *
 * `data-par` marks the photographs the hook drifts individually.
 */
/** Horizontal overscan on each rail photograph. Mirrors `PAR_LIMIT`. */
const PAR_OVERSCAN = 40;

export function HarvestRail({ s, refs }: { s: StoreApi; refs: ScrollRefs }) {
  return (
    <section ref={refs.railOuter} style={{ position: "relative" }} aria-label="This week's harvest">
      <div
        ref={refs.railSticky}
        style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: "28px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            width: "100%",
            margin: "0 auto",
            padding: "0 clamp(16px,3vw,40px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <SectionHeading before="This week's" accent="harvest" accentColor={c.forest} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: c.muted,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {/*
              Which of these two the reader sees is decided in styles.css, by
              the same conditions that stop useScrollFx pinning: a viewport
              under PIN_MIN_WIDTH, or prefers-reduced-motion. Deciding it here
              from PINNED_RAIL alone told every phone to "Keep scrolling" at a
              rail that does not move, because the constant is always true.
            */}
            <span className={PINNED_RAIL ? "railHint railHintPinnable" : "railHint"}>
              <span className="railHintPin">Keep scrolling</span>
              <span className="railHintSwipe">Swipe to browse</span>
            </span>
            <div
              style={{
                width: 160,
                height: 4,
                borderRadius: 4,
                background: c.track,
                overflow: "hidden",
              }}
            >
              <div
                ref={refs.railBar}
                style={{
                  height: "100%",
                  width: "100%",
                  background: c.tomato,
                  transformOrigin: "left",
                  transform: "scaleX(0)",
                }}
              />
            </div>
          </div>
        </div>

        <div
          ref={refs.railScroll}
          className={PINNED_RAIL ? "railScroll railScrollPinned" : "railScroll"}
          style={{ paddingBottom: 6 }}
        >
          <div
            ref={refs.railTrack}
            style={{
              display: "flex",
              gap: 22,
              padding: "0 clamp(16px,3vw,40px)",
              width: "max-content",
              willChange: "transform",
            }}
          >
            {RAIL.map((id, i) => {
              const p = BY[id];
              if (!p) return null;
              const qty = s.qty(id);
              const badge = saveBadge(p);
              return (
                <article
                  key={id}
                  className="railCard"
                  style={{
                    width: "clamp(280px,27vw,370px)",
                    height: "clamp(440px,60vh,560px)",
                    borderRadius: r.tile,
                    background: p.bg,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="zoomFrame"
                    onClick={() => s.openProduct(id)}
                    style={{
                      flex: 1,
                      position: "relative",
                      margin: 12,
                      borderRadius: 20,
                      overflow: "hidden",
                      cursor: "pointer",
                      minHeight: 200,
                    }}
                  >
                    {/*
                      Oversized in both directions so the drift has somewhere
                      to go. Vertical overscan is the design's (-8% / 116%);
                      horizontal is ours, because the design's parallax moves
                      the photograph sideways inside a frame it exactly fills
                      and pulls its own edge into view at both ends of the
                      rail. PAR_OVERSCAN must stay equal to PAR_LIMIT in
                      useScrollFx.
                    */}
                    <img
                      className="zoomImg"
                      data-par=""
                      src={photo(p.img, 700)}
                      alt={p.name}
                      style={{
                        position: "absolute",
                        left: -PAR_OVERSCAN,
                        top: "-8%",
                        width: `calc(100% + ${PAR_OVERSCAN * 2}px)`,
                        height: "116%",
                        objectFit: "cover",
                        transition: `transform .8s ${ease.travel}`,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 14,
                        left: 16,
                        fontFamily: font.display,
                        fontSize: 22,
                        color: c.onTomato,
                        background: "rgba(20,32,27,.55)",
                        backdropFilter: "blur(6px)",
                        padding: "4px 10px",
                        borderRadius: r.pill,
                        pointerEvents: "none",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {badge && (
                      <span
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 16,
                          background: c.tomato,
                          color: c.onTomato,
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          padding: "5px 9px",
                          borderRadius: 6,
                          pointerEvents: "none",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "4px 22px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: ".12em",
                          textTransform: "uppercase",
                          color: c.inkSoft,
                        }}
                      >
                        {p.origin}
                      </span>
                      <span style={{ fontSize: 13, color: c.inkSoft }}>{p.unit}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => s.openProduct(id)}
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: font.display,
                        fontSize: 32,
                        lineHeight: 0.95,
                        textTransform: "uppercase",
                        color: c.ink,
                      }}
                    >
                      {p.name}
                    </button>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 800 }}>{money(p.price)}</span>
                      {qty === 0 ? (
                        <button
                          type="button"
                          className="addDark"
                          onClick={() => s.add(id)}
                          style={{
                            height: 44,
                            padding: "0 20px",
                            borderRadius: r.pill,
                            border: 0,
                            background: c.ink,
                            color: c.cream,
                            fontWeight: 800,
                            fontSize: 14,
                            cursor: "pointer",
                            transition: "background .2s",
                          }}
                        >
                          Add +
                        </button>
                      ) : (
                        <Stepper
                          qty={qty}
                          inc={() => s.setQty(id, qty + 1)}
                          dec={() => s.setQty(id, qty - 1)}
                          ground="ink"
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
