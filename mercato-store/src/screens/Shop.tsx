import { c, font, r } from "../theme";
import { CATEGORIES, PRODUCTS, photo } from "../data";
import { MAX_PRICE } from "../useStore";
import { Pill, ProductCard } from "../components/ui";
import type { Sort } from "../types";
import type { StoreApi } from "../useStore";

/**
 * The shop, filtered four ways at once.
 *
 * ── THE FILTERS COMPOSE, AND "DEALS" IS ONE OF THEM ─────────────────────────
 *
 * Deals is drawn as an eighth department because that is where a person looks
 * for it, but it is not a department — it is "has a was-price". Keeping it in
 * the same control means one row of pills instead of a row plus a stray
 * checkbox, at the cost of the two-branch test below.
 *
 * ── A DIET FILTER IS AND, NOT OR ────────────────────────────────────────────
 *
 * Picking Organic and Vegan means both. The other reading — either — returns
 * more results, which looks better and answers a question nobody asked.
 */

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "az", label: "Name A–Z" },
];

const DIETS = ["Organic", "Vegan", "Local"];

export function Shop({ s }: { s: StoreApi }) {
  const query = s.query.trim().toLowerCase();

  const list = PRODUCTS.filter((p) => {
    if (s.cat === "Deals" && !p.was) return false;
    if (s.cat !== "All" && s.cat !== "Deals" && p.cat !== s.cat) return false;
    if (s.diets.length && !s.diets.every((d) => (p.diet as string[]).includes(d))) return false;
    if (p.price > s.maxPrice) return false;
    if (query && !`${p.name} ${p.cat} ${p.origin}`.toLowerCase().includes(query)) return false;
    return true;
  });

  // Sorted on a copy. `PRODUCTS` is the catalogue, and sorting it in place
  // would silently reorder the rail, the best sellers and the pairings.
  const sorted = [...list];
  if (s.sort === "low") sorted.sort((a, b) => a.price - b.price);
  if (s.sort === "high") sorted.sort((a, b) => b.price - a.price);
  if (s.sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));

  const hasFilters =
    s.diets.length > 0 || s.maxPrice < MAX_PRICE || !!s.query || s.cat !== "All";
  const title = s.query ? `“${s.query}”` : s.cat === "All" ? "All groceries" : s.cat;

  return (
    <main
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "40px clamp(16px,3vw,40px) 96px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex",
              gap: 8,
              fontSize: 13,
              color: c.muted,
              fontWeight: 600,
            }}
          >
            <button
              type="button"
              onClick={s.goHome}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                color: c.muted,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Home
            </button>
            <span aria-hidden="true">/</span>
            <span>Shop</span>
          </nav>
          <h1
            style={{
              margin: 0,
              fontFamily: font.display,
              fontWeight: 400,
              textTransform: "uppercase",
              fontSize: "clamp(52px,7vw,104px)",
              lineHeight: 0.9,
              textWrap: "balance",
            }}
          >
            {title}
          </h1>
          <span style={{ fontSize: 15, color: c.muted }}>
            {sorted.length} {sorted.length === 1 ? "product" : "products"}
          </span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Sort</span>
          <select
            value={s.sort}
            onChange={(e) => s.setSort(e.target.value as Sort)}
            style={{
              height: 44,
              padding: "0 14px",
              borderRadius: r.pill,
              border: `1.5px solid ${c.ink}`,
              background: c.panel,
              fontWeight: 700,
              fontSize: 14,
              color: c.ink,
            }}
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 28,
          paddingBottom: 24,
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        {["All", "Deals", ...CATEGORIES.map(([n]) => n)].map((cat) => (
          <Pill key={cat} label={cat} on={s.cat === cat} onClick={() => s.setCat(cat)} />
        ))}
      </div>

      <div
        className="shopLayout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px,280px) 3fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        <aside
          className="shopFilters"
          style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 280 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: c.muted,
              }}
            >
              Dietary &amp; sourcing
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DIETS.map((d) => {
                const on = s.diets.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => s.toggleDiet(d)}
                    aria-pressed={on}
                    style={{
                      height: 38,
                      padding: "0 14px",
                      borderRadius: r.pill,
                      border: `1.5px solid ${on ? c.forest : c.lineInput}`,
                      background: on ? c.forest : c.panel,
                      color: on ? c.cream : c.ink,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: c.muted,
              }}
            >
              {/* At the top of its range the slider is off, not set to $20. */}
              Max price · {s.maxPrice >= MAX_PRICE ? "Any" : `$${s.maxPrice}`}
            </span>
            <input
              type="range"
              min={2}
              max={MAX_PRICE}
              step={1}
              value={s.maxPrice}
              onChange={(e) => s.setMaxPrice(+e.target.value)}
              style={{ accentColor: c.forest, width: "100%" }}
            />
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={s.clearFilters}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: 0,
                padding: 0,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 14,
                color: c.tomato,
                textDecoration: "underline",
              }}
            >
              Clear all filters
            </button>
          )}

          <div
            className="shopPromo"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              aspectRatio: "4/5",
              color: c.cream,
            }}
          >
            {/*
              Not the design's photo id. That one now resolves to a birthday
              cake on Unsplash, under a panel about repeating your weekly
              milk and eggs. Unsplash reassigns ids; a design file written in
              September has no way to know.
            */}
            <img
              src={photo("1488459716781-31db52582fe9", 600)}
              alt=""
              loading="lazy"
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
                background: "linear-gradient(180deg,rgba(14,30,24,.1),rgba(14,30,24,.9))",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                bottom: 18,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: font.display,
                  fontSize: 34,
                  lineHeight: 0.95,
                  textTransform: "uppercase",
                }}
              >
                Subscribe &amp; save 5%
              </span>
              <span style={{ fontSize: 13, color: c.onDark }}>
                Repeat your weekly staples automatically. Skip anytime.
              </span>
            </div>
          </div>
        </aside>

        <div className="shopGrid" style={{ minWidth: 0 }}>
          {sorted.length === 0 ? (
            <div
              style={{
                padding: "80px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "center",
              }}
            >
              <span
                style={{ fontFamily: font.display, fontSize: 48, textTransform: "uppercase" }}
              >
                Nothing on this shelf
              </span>
              <span style={{ color: c.muted }}>Try a different search or loosen a filter.</span>
              <button
                type="button"
                onClick={s.clearFilters}
                style={{
                  height: 46,
                  padding: "0 22px",
                  borderRadius: r.pill,
                  border: 0,
                  background: c.forest,
                  color: c.cream,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset shelf
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
                gap: 18,
              }}
            >
              {sorted.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={s.qty(p.id)}
                  variant="shop"
                  onOpen={() => s.openProduct(p.id)}
                  onAdd={() => s.add(p.id)}
                  onInc={() => s.setQty(p.id, s.qty(p.id) + 1)}
                  onDec={() => s.setQty(p.id, s.qty(p.id) - 1)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
