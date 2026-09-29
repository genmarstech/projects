import { STORE_URL } from "../config";
import { SECTIONS } from "../data";
import { c, font, r } from "../theme";
import type { Section } from "../types";
import type { Store as S } from "../useStore";

/**
 * The green rail: wordmark, navigation, store picker, the storefront, the
 * signed-in person.
 *
 * The badge counts are the two numbers worth interrupting somebody for — new
 * orders waiting, and products below par. Everything else you go and look at.
 */
export function Sidebar({
  store, newCount, lowCount,
}: { store: S; newCount: number; lowCount: number }) {
  return (
    <aside
      className="rail"
      style={{
        flex: "0 0 248px", background: c.forest, color: c.cream,
        display: "flex", flexDirection: "column", gap: 28,
        padding: "24px 16px", position: "sticky", top: 0,
        height: "100vh", overflow: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: font.word, fontStyle: "italic", fontSize: 34, lineHeight: 1 }}>
            mercato
          </span>
          <span style={{ fontFamily: font.word, fontSize: 34, color: c.tomato, lineHeight: 1 }}>
            .
          </span>
        </div>
        <span
          style={{
            fontSize: 11, fontWeight: 800, letterSpacing: ".16em",
            textTransform: "uppercase", color: c.amber,
          }}
        >
          Store operations
        </span>
      </div>

      <nav className="rail-nav" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {SECTIONS.map(([key, label]) => {
          const active = store.section === key;
          const count =
            key === "orders" ? newCount : key === "inventory" ? lowCount : 0;
          return (
            <button
              key={key}
              type="button"
              className="nav-item"
              onClick={() => store.setSection(key as Section)}
              aria-current={active ? "page" : undefined}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 10, height: 44, padding: "0 12px", borderRadius: 12, border: 0,
                background: active ? c.cream : "transparent",
                color: active ? c.ink : c.cream,
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                textAlign: "left", transition: "background .2s",
              }}
            >
              <span>{label}</span>
              {count > 0 ? (
                <span
                  style={{
                    minWidth: 24, height: 22, padding: "0 7px", borderRadius: r.pill,
                    background: c.tomato, color: c.onTomato, fontSize: 11,
                    fontWeight: 800, display: "grid", placeItems: "center",
                  }}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="rail-foot" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            background: "rgba(244,238,225,.08)", borderRadius: 16, padding: 14,
            display: "flex", flexDirection: "column", gap: 8,
          }}
        >
          <label
            htmlFor="store-picker"
            style={{
              fontSize: 11, fontWeight: 800, letterSpacing: ".14em",
              textTransform: "uppercase", color: c.onForestSoft,
            }}
          >
            Store
          </label>
          <select
            id="store-picker"
            value={store.store}
            onChange={(e) => store.setStore(e.target.value)}
            style={{
              height: 38, borderRadius: 10, border: 0, background: c.cream,
              color: c.ink, fontWeight: 700, padding: "0 10px",
            }}
          >
            <option value="all">All stores</option>
            <option value="s1">Riverside</option>
            <option value="s2">Oak Park</option>
            <option value="s3">Market Hall</option>
          </select>
        </div>

        {/*
          The customer half of the same shop. It sits under the store picker
          because it answers the question the picker raises — what Riverside
          currently looks like to somebody buying from it — and it opens in a
          new tab so it never takes somebody away from a shift they are
          part-way through.
        */}
        <a
          href={STORE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, padding: "10px 14px", borderRadius: 12,
            border: `1px solid rgba(244,238,225,.18)`,
            color: c.cream, fontWeight: 700, fontSize: 13, textDecoration: "none",
          }}
        >
          View storefront
          <span aria-hidden>↗</span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 10px" }}>
          <span
            aria-hidden
            style={{
              width: 36, height: 36, borderRadius: "50%", background: c.amber,
              color: c.ink, display: "grid", placeItems: "center",
              fontWeight: 800, fontSize: 13,
            }}
          >
            JL
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Jordan Lee</span>
            <span style={{ fontSize: 12, color: c.onForestSoft }}>Store manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
