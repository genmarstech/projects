import { c, font, r } from "../theme";
import { roundMoney } from "../data";
import { FREE_DELIVERY_THRESHOLD, PROMO_CODE } from "../config";
import type { Mode } from "../types";
import type { StoreApi } from "../useStore";

/**
 * The bar that sits over everything, on every screen.
 *
 * It is sticky and it is measured: `useScrollFx` reads its height to work out
 * where the pinned rail should stick. That is why the height is left to the
 * content rather than being fixed — the announcement strip wraps to two lines
 * on a phone, and a hard-coded 110px would leave the rail underlapping it.
 */
export function Header({ s, headerRef }: { s: StoreApi; headerRef: React.Ref<HTMLElement> }) {
  const nav: { label: string; go: () => void }[] = [
    { label: "Shop all", go: () => s.goShop("All", true) },
    { label: "Fresh produce", go: () => s.goShop("Produce") },
    { label: "Deals", go: () => s.goShop("Deals") },
    // Nothing to track before an order exists, so it goes home instead of to
    // a tracking page with no order on it.
    { label: "Track order", go: () => s.go(s.order ? "track" : "home") },
  ];

  const modes: Mode[] = ["Delivery", "Pickup"];

  return (
    <header
      ref={headerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: c.forest,
        color: c.cream,
        boxShadow: `0 1px 0 rgba(244,238,225,.12)`,
      }}
    >
      <div
        style={{
          background: c.tomato,
          color: c.onTomato,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: ".02em",
          padding: "8px 20px",
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          textAlign: "center",
        }}
      >
        <span>Free delivery on orders over {roundMoney(FREE_DELIVERY_THRESHOLD)}</span>
        <span aria-hidden="true">·</span>
        <span>First shop? Code {PROMO_CODE} takes 10% off</span>
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "12px clamp(16px,3vw,40px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px,2vw,24px)",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={s.goHome}
          aria-label="Mercato home"
          style={{
            background: "none",
            border: 0,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: font.word,
              fontStyle: "italic",
              fontSize: 36,
              lineHeight: 1,
              color: c.cream,
            }}
          >
            mercato
          </span>
          <span style={{ fontFamily: font.word, fontSize: 36, color: c.tomato, lineHeight: 1 }}>
            .
          </span>
        </button>

        <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {nav.map((n) => (
            <button
              key={n.label}
              type="button"
              className="navBtn"
              onClick={n.go}
              style={{
                background: "none",
                border: 0,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
                padding: "9px 13px",
                borderRadius: r.pill,
                color: c.cream,
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            s.goShop("All");
          }}
          style={{
            flex: "1 1 240px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: c.cream,
            color: c.ink,
            borderRadius: r.pill,
            padding: "0 5px 0 18px",
            height: 46,
            minWidth: 200,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            placeholder="Search avocados, sourdough, cold brew…"
            aria-label="Search the shop"
            style={{
              flex: 1,
              border: 0,
              background: "transparent",
              outline: "none",
              fontSize: 15,
              minWidth: 0,
              color: c.ink,
            }}
          />
          <button
            type="submit"
            style={{
              border: 0,
              background: c.forest,
              color: c.cream,
              height: 36,
              padding: "0 16px",
              borderRadius: r.pill,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        <div
          role="group"
          aria-label="Delivery or collection"
          style={{
            display: "flex",
            background: "rgba(244,238,225,.1)",
            borderRadius: r.pill,
            padding: 4,
          }}
        >
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => s.setMode(m)}
              aria-pressed={s.mode === m}
              style={{
                border: 0,
                cursor: "pointer",
                borderRadius: r.pill,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                background: s.mode === m ? c.cream : "transparent",
                color: s.mode === m ? c.ink : c.cream,
                transition: "background .3s,color .3s",
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="liftSmall"
          onClick={s.openCart}
          aria-label={`Basket, ${s.totals.count} items, ${s.totals.subTxt}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: c.amber,
            color: c.ink,
            border: 0,
            borderRadius: r.pill,
            height: 46,
            padding: "0 8px 0 16px",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 14,
            transition: "transform .2s",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span>{s.totals.subTxt}</span>
          <span
            style={{
              background: c.ink,
              color: c.amber,
              borderRadius: r.pill,
              minWidth: 30,
              height: 30,
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              padding: "0 8px",
            }}
          >
            {s.totals.count}
          </span>
        </button>
      </div>
    </header>
  );
}
