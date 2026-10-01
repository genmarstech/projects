import { CATEGORIES, MATERIALS, PRICE_BANDS, PRODUCTS } from "../data";
import { SWATCHES } from "../theme";
import type { Sort } from "../types";
import type { StoreApi } from "../useStore";
import { ProductCard } from "../components/ProductCard";
import { Chip, GUTTER } from "../components/ui";

/**
 * The catalogue.
 *
 * Filtering is derived here rather than held in `useStore`: it is a pure
 * function of four pieces of state and fourteen products, recomputed on a
 * render that was going to happen anyway.
 */
export function Shop({ store }: { store: StoreApi }) {
  const { cat, band, mats, cols, sort, desktop } = store;

  const filtered = PRODUCTS.filter(
    (p) =>
      (cat === "All" || p.cat === cat) &&
      (band == null || (p.price >= PRICE_BANDS[band]![1] && p.price < PRICE_BANDS[band]![2])) &&
      (!mats.length || mats.includes(p.material)) &&
      (!cols.length || p.colours.some((c) => cols.includes(c))),
  ).sort((a, b) =>
    sort === "low" ? a.price - b.price
      : sort === "high" ? b.price - a.price
      : sort === "new" ? Number(b.tag === "New") - Number(a.tag === "New")
      : a.order - b.order,
  );

  const active = [
    ...(cat !== "All" ? [{ label: cat, remove: () => store.setCat("All") }] : []),
    ...(band != null ? [{ label: `KES ${PRICE_BANDS[band]![0]}`, remove: () => store.setBand(null) }] : []),
    ...mats.map((m) => ({ label: m, remove: () => store.toggleMat(m) })),
    ...cols.map((c) => ({ label: c, remove: () => store.toggleCol(c) })),
  ];
  const filterCount = (band != null ? 1 : 0) + mats.length + cols.length;
  const results = `${filtered.length} piece${filtered.length === 1 ? "" : "s"}`;

  const group = (title: string, children: React.ReactNode) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase" }}>{title}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );

  const panel = (
    <>
      {!desktop && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "400 26px/1 var(--f-display)" }}>Filters</span>
          <button type="button" onClick={store.closeFilters} aria-label="Close" style={{ width: 44, height: 44, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--c-ink)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          </button>
        </div>
      )}
      {group("Price (KES)", PRICE_BANDS.map(([label], i) => (
        <Chip key={label} small label={label} on={band === i} onClick={() => store.setBand(band === i ? null : i)} />
      )))}
      {group("Material", MATERIALS.map((m) => (
        <Chip key={m} small label={m} on={mats.includes(m)} onClick={() => store.toggleMat(m)} />
      )))}
      {group("Colour", Object.keys(SWATCHES).map((c) => (
        <Chip key={c} small label={c} swatch={SWATCHES[c]} on={cols.includes(c)} onClick={() => store.toggleCol(c)} />
      )))}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button type="button" onClick={store.clearFilters} style={{ height: 46, padding: "0 18px", borderRadius: 999, border: "1px solid var(--c-line)", background: "transparent", color: "var(--c-ink)", font: "600 13px/1 var(--f-body)", cursor: "pointer" }}>
          Clear all
        </button>
        {!desktop && (
          <button type="button" onClick={store.closeFilters} style={{ flex: 1, height: 46, borderRadius: 999, border: 0, background: "var(--c-ink)", color: "var(--c-bg)", font: "600 14px/1 var(--f-body)", cursor: "pointer" }}>
            Show {results}
          </button>
        )}
      </div>
      <div style={{ padding: 18, borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ font: "400 19px/1.2 var(--f-display)" }}>Need a different size?</span>
        <span style={{ font: "400 13.5px/1.5 var(--f-body)", color: "var(--c-muted)" }}>
          We build to your measurements, fabric and budget.
        </span>
        <a href="#" onClick={(e) => { e.preventDefault(); store.go("custom"); }} style={{ font: "600 13.5px/1 var(--f-body)", color: "var(--c-accent)", marginTop: 4 }}>
          Start a custom order →
        </a>
      </div>
    </>
  );

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(36px,6vw,72px) ${GUTTER} clamp(64px,10vw,120px)`, display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ font: "500 13px/1 var(--f-body)", color: "var(--c-muted)" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); store.go("home"); }} style={{ color: "var(--c-muted)" }}>Home</a> / Shop
        </span>
        <h1 style={{ margin: 0, font: "400 clamp(40px,8vw,84px)/1 var(--f-display)", letterSpacing: "-.015em" }}>
          {cat === "All" ? "The collection" : cat}
        </h1>
        <p style={{ margin: 0, font: "400 16px/1.55 var(--f-body)", color: "var(--c-muted)", maxWidth: "56ch" }}>
          Every piece is made to order in Nairobi. Custom sizes and fabrics available on request.
        </p>
      </div>

      <div className="rail" style={{ display: "flex", gap: 8, margin: `0 calc(-1 * ${GUTTER})`, padding: `0 ${GUTTER}` }}>
        {["All", ...CATEGORIES].map((c) => (
          <Chip key={c} label={c} on={cat === c} onClick={() => store.setCat(c)} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 0", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {!desktop && (
            <button type="button" onClick={store.openFilters} style={{ height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid var(--c-ink)", background: "transparent", color: "var(--c-ink)", display: "inline-flex", alignItems: "center", gap: 8, font: "600 13px/1 var(--f-body)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filters{filterCount ? ` (${filterCount})` : ""}
            </button>
          )}
          <span style={{ font: "500 13px/1 var(--f-body)", color: "var(--c-muted)" }}>{results}</span>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, font: "500 13px/1 var(--f-body)", color: "var(--c-muted)" }}>
          Sort
          <select
            value={sort}
            onChange={(e) => store.setSort(e.target.value as Sort)}
            style={{ height: 40, padding: "0 12px", borderRadius: 999, border: "1px solid var(--c-line)", background: "var(--c-bg)", color: "var(--c-ink)", font: "600 13px/1 var(--f-body)" }}
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="new">Newest</option>
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: desktop ? "260px minmax(0,1fr)" : "minmax(0,1fr)", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}>
        {store.filtersOpen && !desktop && (
          <div onClick={store.closeFilters} style={{ position: "fixed", inset: 0, zIndex: 69, background: "rgba(20,14,10,.45)" }} />
        )}
        <aside
          style={
            desktop
              ? { position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 28 }
              : {
                  position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 70, maxHeight: "86svh", overflowY: "auto",
                  background: "var(--c-bg)", borderRadius: "20px 20px 0 0", padding: "16px 20px 24px",
                  display: store.filtersOpen ? "flex" : "none", flexDirection: "column", gap: 26,
                  boxShadow: "0 -20px 40px -20px rgba(0,0,0,.3)",
                }
          }
        >
          {panel}
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {active.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {active.map((a) => (
                <button key={a.label} type="button" onClick={a.remove} style={{ height: 32, padding: "0 12px", borderRadius: 999, border: 0, background: "var(--c-surface)", color: "var(--c-ink)", font: "500 12.5px/1 var(--f-body)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {a.label} <span aria-hidden style={{ opacity: .6 }}>✕</span>
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: "64px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, border: "1px dashed var(--c-line)", borderRadius: 4 }}>
              <span style={{ font: "400 26px/1.2 var(--f-display)" }}>Nothing matches — yet.</span>
              <span style={{ font: "400 15px/1.5 var(--f-body)", color: "var(--c-muted)", maxWidth: "40ch" }}>
                We can make it for you. Send us a photo and your measurements.
              </span>
              <a className="btnInk" href="#" onClick={(e) => { e.preventDefault(); store.go("custom"); }} style={{ height: 48, padding: "0 22px", borderRadius: 999, background: "var(--c-ink)", color: "var(--c-bg)", display: "inline-flex", alignItems: "center", font: "600 14px/1 var(--f-body)" }}>
                Custom order
              </a>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(46%,240px),1fr))", gap: "clamp(24px,3vw,36px) clamp(12px,2vw,24px)" }}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
