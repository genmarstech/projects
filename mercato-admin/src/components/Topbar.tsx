import { c, font, r } from "../theme";
import type { Store } from "../useStore";

/** The date, the section title, search, and the live-orders switch. */
export function Topbar({ store, title }: { store: Store; title: string }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(244,238,225,.92)", backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${c.line}`,
        padding: "16px clamp(16px,3vw,36px)",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: "1 1 240px" }}>
        <span
          style={{
            fontSize: 12, fontWeight: 800, letterSpacing: ".14em",
            textTransform: "uppercase", color: c.muted,
          }}
        >
          {today}
        </span>
        <h1
          style={{
            margin: 0, fontFamily: font.display, fontWeight: 400,
            fontSize: "clamp(34px,4vw,48px)", lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: c.panel, border: `1px solid ${c.line}`,
          borderRadius: r.pill, height: 44, padding: "0 16px",
          flex: "0 1 300px", minWidth: 180,
        }}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="search" className="sr-only" style={srOnly}>
          Search orders, products, customers
        </label>
        <input
          id="search"
          value={store.query}
          onChange={(e) => store.setQuery(e.target.value)}
          placeholder="Search orders, products, customers"
          style={{
            flex: 1, border: 0, background: "transparent", outline: "none",
            fontSize: 14, minWidth: 0, color: c.ink,
          }}
        />
      </div>

      {/*
        The live switch is a real toggle rather than a decorative dot: the
        feed adds an order every twelve seconds, and anybody reading the
        table needs a way to stop the ground moving under them.
      */}
      <button
        type="button"
        onClick={store.toggleLive}
        aria-pressed={store.live}
        style={{
          display: "flex", alignItems: "center", gap: 10, height: 44,
          padding: "0 16px", borderRadius: r.pill,
          border: `1.5px solid ${c.ink}`, background: "transparent",
          fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}
      >
        <span style={{ position: "relative", width: 9, height: 9 }} aria-hidden>
          <span
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: store.live ? c.liveGreen : c.faint,
              animation: store.live ? "mcPulse 1.8s infinite" : "none",
            }}
          />
          <span
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: store.live ? c.liveGreen : c.faint,
            }}
          />
        </span>
        {store.live ? "Live orders on" : "Live orders paused"}
      </button>
    </header>
  );
}

const srOnly = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap",
} as const;
