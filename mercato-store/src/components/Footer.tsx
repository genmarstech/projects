import { c, font, r } from "../theme";
import { ADMIN_URL } from "../config";
import type { StoreApi } from "../useStore";

const COLUMNS = [
  { title: "Shop", links: ["Fresh produce", "Bakery", "Dairy & eggs", "Weekly deals", "Gift cards"] },
  { title: "Help", links: ["Delivery areas", "Substitutions", "Returns & refunds", "Store hours", "Contact us"] },
];

export function Footer({ s }: { s: StoreApi }) {
  return (
    <footer style={{ background: c.ink, color: c.cream }}>
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(56px,7vw,96px) clamp(16px,3vw,40px) 32px",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              gridColumn: "span 2",
              maxWidth: 520,
            }}
          >
            <span
              style={{
                fontFamily: font.display,
                fontSize: "clamp(40px,5vw,64px)",
                lineHeight: 0.92,
                textTransform: "uppercase",
              }}
            >
              Fresh drops, <span style={{ color: c.amber }}>every Thursday.</span>
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                s.showToast("ban", "You’re on the list");
              }}
              style={{
                display: "flex",
                gap: 8,
                background: c.cream,
                borderRadius: r.pill,
                padding: 5,
                maxWidth: 440,
              }}
            >
              <input
                type="email"
                placeholder="you@email.com"
                aria-label="Email address"
                style={{
                  flex: 1,
                  border: 0,
                  background: "transparent",
                  outline: "none",
                  padding: "0 14px",
                  fontSize: 15,
                  minWidth: 0,
                  color: c.ink,
                }}
              />
              <button
                type="submit"
                style={{
                  height: 44,
                  padding: "0 20px",
                  borderRadius: r.pill,
                  border: 0,
                  background: c.tomato,
                  color: c.onTomato,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Subscribe
              </button>
            </form>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: c.onInkSoft,
                }}
              >
                {col.title}
              </span>
              {col.links.map((l) => (
                <span key={l} style={{ fontSize: 15, color: c.onDark }}>
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 20,
            flexWrap: "wrap",
            borderTop: "1px solid rgba(244,238,225,.15)",
            paddingTop: 24,
          }}
        >
          <span
            style={{
              fontFamily: font.word,
              fontStyle: "italic",
              fontSize: "clamp(64px,12vw,180px)",
              lineHeight: 0.8,
              color: c.cream,
            }}
          >
            mercato
            <span style={{ color: c.tomato, fontStyle: "normal" }}>.</span>
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {/*
              The staff side of the same shop. In the design this was a
              relative link to a sibling design file; here the sibling is its
              own deployment, so it is an absolute address and opens away
              from the basket somebody is halfway through filling.
            */}
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13, color: c.amber, fontWeight: 700, textDecoration: "none" }}
            >
              Staff admin →
            </a>
            <span style={{ fontSize: 13, color: c.onInkSoft }}>
              © 2026 Mercato Market · Photography via Unsplash
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
