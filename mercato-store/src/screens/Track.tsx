import { c, ease, font, r } from "../theme";
import { photo } from "../data";
import type { StoreApi } from "../useStore";

/**
 * Five stages, advancing on a timer.
 *
 * ── THE WORDS CHANGE WITH THE FULFILMENT, NOT JUST THE LABEL ────────────────
 *
 * A collection order is never "out for delivery" and never has a driver
 * twelve minutes away. Both the step names and the paragraph beneath the
 * headline come from the mode, because a tracker that says the wrong thing
 * confidently is worse than one that says less.
 *
 * ── THERE IS NO SERVER, AND THE PAGE DOES NOT PRETEND OTHERWISE ─────────────
 *
 * The timer in `useStore` walks the stages. Nothing here claims a live feed,
 * a real driver or a real position on a map — the photograph is a van, not a
 * tracking map with a moving pin.
 */

const STEPS = (delivery: boolean) => [
  "Order confirmed",
  "Shopper is picking",
  "Packed & cold-checked",
  delivery ? "Out for delivery" : "Ready for collection",
  delivery ? "Delivered" : "Collected",
];

const HEADLINES = (delivery: boolean) => [
  "Order confirmed",
  "Picking your order",
  "Packed and ready",
  delivery ? "On its way" : "Ready for you",
  delivery ? "Delivered. Enjoy." : "Collected. Enjoy.",
];

const BLURBS = (delivery: boolean) => [
  "We have sent a receipt to your email. Your shopper will start soon.",
  "Maya is walking the aisles, choosing the ripest and freshest for you.",
  "Chilled items are packed in insulated bags and temperature-checked.",
  delivery
    ? "Your driver is 12 minutes away. We will text when they arrive."
    : "Head to the collection point and show your order number.",
  "Thanks for shopping with Mercato. Rate your shopper in the app.",
];

export function Track({ s }: { s: StoreApi }) {
  const order = s.order;
  const delivery = s.mode === "Delivery";
  const stage = s.stage;

  if (!order) {
    return (
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "96px clamp(16px,3vw,40px)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: font.display,
            fontWeight: 400,
            textTransform: "uppercase",
            fontSize: "clamp(48px,7vw,96px)",
            lineHeight: 0.9,
          }}
        >
          No order to track
        </h1>
        <p style={{ margin: 0, fontSize: 17, color: c.inkSoft }}>
          Once you place an order it appears here, stage by stage.
        </p>
        <button
          type="button"
          onClick={() => s.goShop("All", true)}
          style={{
            height: 52,
            padding: "0 24px",
            borderRadius: r.pill,
            border: 0,
            background: c.forest,
            color: c.cream,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Start shopping
        </button>
      </main>
    );
  }

  const items = order.lines.reduce((a, l) => a + l.qty, 0);
  const steps = STEPS(delivery);

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "48px clamp(16px,3vw,40px) 96px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
        gap: 28,
        alignItems: "start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: c.muted,
          }}
        >
          Order {order.no} · {order.slot}
        </span>
        <h1
          aria-live="polite"
          style={{
            margin: 0,
            fontFamily: font.display,
            fontWeight: 400,
            textTransform: "uppercase",
            fontSize: "clamp(56px,8vw,120px)",
            lineHeight: 0.88,
            textWrap: "balance",
          }}
        >
          {HEADLINES(delivery)[stage]}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.55,
            color: c.inkSoft,
            maxWidth: 480,
            textWrap: "pretty",
          }}
        >
          {BLURBS(delivery)[stage]}
        </p>

        <div style={{ height: 8, borderRadius: 8, background: c.track, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${(stage / 4) * 100}%`,
              background: c.forest,
              transition: `width 1.2s ${ease.travel}`,
            }}
          />
        </div>

        <ol style={{ display: "flex", flexDirection: "column", margin: 0, padding: 0, listStyle: "none" }}>
          {steps.map((label, i) => (
            <li
              key={label}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "14px 0",
                borderBottom: `1px solid ${c.line}`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: i < stage ? c.forest : i === stage ? c.tomato : c.off,
                  color: c.cream,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  transition: "background .6s",
                }}
              >
                {i < stage ? "✓" : i + 1}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  opacity: i <= stage ? 1 : 0.55,
                  transition: "opacity .6s",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 16 }}>{label}</span>
                <span style={{ fontSize: 14, color: c.muted }}>
                  {i < stage ? "Done" : i === stage ? "In progress" : "Up next"}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => s.goShop("All", true)}
            style={{
              height: 52,
              padding: "0 24px",
              borderRadius: r.pill,
              border: 0,
              background: c.forest,
              color: c.cream,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Keep shopping
          </button>
          <button
            type="button"
            onClick={s.reorder}
            style={{
              height: 52,
              padding: "0 24px",
              borderRadius: r.pill,
              border: `1.5px solid ${c.ink}`,
              background: "transparent",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Reorder these items
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            position: "relative",
            borderRadius: r.tile,
            overflow: "hidden",
            aspectRatio: "5/4",
            color: c.cream,
          }}
        >
          <img
            src={photo("1542838132-92c53300491e", 1000)}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg,rgba(14,30,24,0) 40%,rgba(14,30,24,.9))",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                Your shopper
              </span>
              <span
                style={{
                  fontFamily: font.display,
                  fontSize: 36,
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                Maya R.
              </span>
            </div>
            <span
              style={{
                background: c.amber,
                color: c.ink,
                borderRadius: r.pill,
                padding: "10px 16px",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {stage < 1
                ? "Starting soon"
                : stage === 1
                  ? `${Math.ceil(items / 2)} of ${items} items picked`
                  : `All ${items} items picked`}
            </span>
          </div>
        </div>

        <div
          style={{
            background: c.panel,
            border: `1px solid ${c.lineCard}`,
            borderRadius: r.card,
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {order.lines.map((l) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={photo(l.thumb, 200)}
                alt=""
                style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
              />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
                {l.qty} × {l.name}
              </span>
              <span style={{ fontSize: 14 }}>{l.lineTxt}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 12,
              borderTop: `1px solid ${c.line}`,
              fontWeight: 800,
            }}
          >
            <span>Total charged</span>
            <span>{order.totalTxt}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
