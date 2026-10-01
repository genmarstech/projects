import { useRef } from "react";
import { FREE_DELIVERY_FROM } from "../config";
import { EXTRA_SHOTS, GALLERY_CAPTIONS, PRODUCTS, ZONES, kes, px } from "../data";
import { BRAND_GREEN, SWATCHES } from "../theme";
import { deposit, waProduct, type StoreApi } from "../useStore";
import { ProductCard } from "../components/ProductCard";
import { GUTTER, Shot } from "../components/ui";

/**
 * One piece of furniture.
 *
 * The gallery is four scroll-snapped panes rather than a thumbnail strip —
 * the design's choice, and the right one on a phone, where a swipe is
 * cheaper than a tap. The dots below both report and control position, so
 * the scroll handler and the dot clicks drive the same `scrollLeft`.
 *
 * Only the first image is the product's own. The other three are drawn from
 * a shared pool, deterministically by index, so a given product always shows
 * the same four and the catalogue does not need four photographs apiece.
 */
export function Product({ store }: { store: StoreApi }) {
  const p = store.product;
  const gallery = useRef<HTMLDivElement>(null);
  const colour = store.swatch ?? p.colours[0]!;

  const seed = PRODUCTS.findIndex((x) => x.id === p.id);
  const pool = EXTRA_SHOTS.filter((id) => id !== p.img);
  const shots = GALLERY_CAPTIONS.map((cap, i) => ({
    cap,
    img: i === 0 ? px(p.img, 1200) : px(pool[(seed + i * 2) % pool.length]!, 1200),
  }));

  const zone = ZONES.find((z) => z.areas.includes(store.area)) ?? ZONES[0]!;
  const feeText =
    zone.fee === "free"
      ? p.price >= FREE_DELIVERY_FROM
        ? "Free delivery & assembly"
        : `KES 1,500 delivery · free over ${kes(FREE_DELIVERY_FROM)}`
      : `${zone.fee} delivery & assembly`;

  const related = PRODUCTS.filter((x) => x.id !== p.id)
    .sort((a, b) => Number(b.cat === p.cat) - Number(a.cat === p.cat) || a.order - b.order)
    .slice(0, 4);

  const accordion: [string, string][] = [
    ["Materials & care", `Solid ${p.material.toLowerCase()} · ${p.fabric}. Wipe with a dry cloth; re-oil timber every 6–12 months. Keep out of direct afternoon sun to preserve the finish.`],
    ["Warranty", "5-year warranty on all frames and joinery, 1 year on fabric and cushions. Free repairs within Nairobi during the warranty period."],
    ["Lead time & lipa pole pole", `Made to order in 2–3 weeks. Reserve with a 40% deposit (${deposit(p)}) via M-Pesa and pay the balance before delivery.`],
  ];

  return (
    <>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(16px,3vw,40px) ${GUTTER} 0`, display: "flex", flexDirection: "column", gap: 20 }}>
        <span style={{ font: "500 13px/1 var(--f-body)", color: "var(--c-muted)" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); store.go("shop", { cat: "All" }); }} style={{ color: "var(--c-muted)" }}>Shop</a>
          {" / "}
          <a href="#" onClick={(e) => { e.preventDefault(); store.go("shop", { cat: p.cat }); }} style={{ color: "var(--c-muted)" }}>{p.cat}</a>
          {" / "}{p.name}
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(24px,5vw,72px)", alignItems: "start" }}>
          {/* gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div
              ref={gallery}
              className="rail"
              onScroll={(e) => {
                const el = e.currentTarget;
                const i = Math.round(el.scrollLeft / el.clientWidth);
                if (i !== store.galleryIndex) store.setGalleryIndex(i);
              }}
              style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "100%", scrollSnapType: "x mandatory", borderRadius: 4, margin: store.desktop ? 0 : `0 calc(-1 * ${GUTTER})` }}
            >
              {shots.map((g, i) => (
                <div key={g.cap} style={{ position: "relative", aspectRatio: "4/5", scrollSnapAlign: "start", background: p.tone, overflow: "hidden" }}>
                  <Shot src={g.img} alt={`${p.name} — ${g.cap.toLowerCase()}`} tone={p.tone} loading={i === 0 ? "eager" : "lazy"} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {shots.map((g, i) => (
                  <button
                    key={g.cap}
                    type="button"
                    aria-label={`Image ${i + 1}: ${g.cap}`}
                    aria-current={i === store.galleryIndex}
                    onClick={() => {
                      const el = gallery.current;
                      el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                    }}
                    /* The bar is 6px because that is the design. The target
                       is the padding around it — 40px of it, which costs no
                       layout because the row is centred on the bar. */
                    style={{ border: 0, padding: "17px 0", background: "transparent", cursor: "pointer", display: "block" }}
                  >
                    <span
                      style={{ display: "block", width: i === store.galleryIndex ? 28 : 10, height: 6, borderRadius: 3, background: i === store.galleryIndex ? "var(--c-ink)" : "var(--c-line)", transition: "all .3s" }}
                    />
                  </button>
                ))}
              </div>
              <span style={{ font: "500 12px/1 var(--f-body)", color: "var(--c-muted)" }}>{store.galleryIndex + 1} / {shots.length}</span>
            </div>
          </div>

          {/* detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.tag && (
                <span style={{ alignSelf: "flex-start", font: "600 11px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-accent)" }}>{p.tag}</span>
              )}
              <h1 style={{ margin: 0, font: "400 clamp(36px,6vw,58px)/1.02 var(--f-display)", letterSpacing: "-.01em", textWrap: "balance" }}>{p.name}</h1>
              <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "6px 14px" }}>
                <span style={{ font: "600 26px/1 var(--f-body)", letterSpacing: "-.01em" }}>{kes(p.price)}</span>
                <span style={{ font: "400 14px/1.4 var(--f-body)", color: "var(--c-muted)" }}>or {deposit(p)} deposit · lipa pole pole</span>
              </div>
              <p style={{ margin: "4px 0 0", font: "400 16px/1.65 var(--f-body)", color: "var(--c-muted)", textWrap: "pretty" }}>{p.desc}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ font: "600 13px/1 var(--f-body)" }}>
                Colour — <span style={{ fontWeight: 400, color: "var(--c-muted)" }}>{colour}</span>
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {p.colours.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => store.setSwatch(c)}
                    aria-label={c}
                    aria-pressed={c === colour}
                    title={c}
                    style={{ width: 44, height: 44, borderRadius: "50%", border: 0, padding: 0, background: SWATCHES[c], cursor: "pointer", boxShadow: c === colour ? "0 0 0 2px var(--c-bg), 0 0 0 4px var(--c-ink)" : "inset 0 0 0 1px rgba(0,0,0,.15)", transition: "box-shadow .25s" }}
                  />
                ))}
              </div>
              <span style={{ font: "400 13px/1.4 var(--f-body)", color: "var(--c-muted)" }}>
                Fabric: {p.fabric} ·{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); store.go("contact"); }} style={{ color: "var(--c-accent)" }}>Request free fabric samples</a>
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ padding: "16px 12px 16px 0", display: "flex", flexDirection: "column", gap: 6, borderRight: "1px solid var(--c-line)" }}>
                <span style={{ font: "600 11px/1 var(--f-body)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-muted)" }}>Material</span>
                <span style={{ font: "500 14.5px/1.4 var(--f-body)" }}>Solid {p.material.toLowerCase()} · {p.fabric}</span>
              </div>
              <div style={{ padding: "16px 0 16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ font: "600 11px/1 var(--f-body)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-muted)" }}>Dimensions</span>
                <span style={{ font: "500 14.5px/1.4 var(--f-body)" }}>{p.dims}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={store.openMpesa}
                style={{ height: 58, borderRadius: 999, border: 0, background: BRAND_GREEN.mpesa, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, font: "700 16px/1 var(--f-body)", cursor: "pointer" }}
              >
                <span style={{ padding: "5px 8px", borderRadius: 4, background: "#FFFFFF", color: BRAND_GREEN.mpesa, font: "800 11px/1 var(--f-body)", letterSpacing: ".04em" }}>M-PESA</span>
                Pay with M-Pesa
              </button>
              <a
                className="btnOutline"
                href={waProduct(p, colour, store.area)}
                target="_blank"
                rel="noreferrer"
                style={{ height: 58, borderRadius: 999, border: "1px solid var(--c-ink)", color: "var(--c-ink)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, font: "600 16px/1 var(--f-body)" }}
              >
                Order via WhatsApp
              </a>
              <span style={{ font: "400 12.5px/1.4 var(--f-body)", color: "var(--c-muted)", textAlign: "center" }}>
                Visa &amp; Mastercard also accepted · Secure checkout
              </span>
            </div>

            <div style={{ padding: 18, borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, font: "600 14px/1.2 var(--f-body)" }}>
                Deliver to
                <select
                  value={store.area}
                  onChange={(e) => store.setArea(e.target.value)}
                  style={{ height: 40, padding: "0 12px", borderRadius: 999, border: "1px solid var(--c-line)", background: "var(--c-bg)", color: "var(--c-ink)", font: "600 13px/1 var(--f-body)", maxWidth: "60%" }}
                >
                  {ZONES.flatMap((z) => z.areas).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "400 20px/1.2 var(--f-display)" }}>Arrives in {zone.days}</span>
                <span style={{ font: "400 13.5px/1.5 var(--f-body)", color: "var(--c-muted)" }}>{feeText} · {zone.name}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", border: "1px solid var(--c-line)", borderRadius: 4 }}>
              <span aria-hidden style={{ flex: "none", width: 36, height: 36, borderRadius: "50%", background: "var(--c-accent)", color: "var(--c-bg)", display: "grid", placeItems: "center", font: "400 18px/1 var(--f-display)" }}>↔</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "600 14px/1.3 var(--f-body)" }}>Custom sizes available</span>
                <span style={{ font: "400 13.5px/1.5 var(--f-body)", color: "var(--c-muted)" }}>
                  Need it longer, deeper or in a different wood?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); store.go("custom"); }} style={{ color: "var(--c-accent)" }}>Request a custom build</a>.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {accordion.map(([title, body], i) => {
                const open = store.accordion === i;
                return (
                  <div key={title} style={{ borderTop: "1px solid var(--c-line)" }}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => store.setAccordion(open ? -1 : i)}
                      style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", border: 0, background: "transparent", color: "var(--c-ink)", font: "600 14.5px/1.3 var(--f-body)", cursor: "pointer", padding: 0, textAlign: "left" }}
                    >
                      {title}
                      <span aria-hidden style={{ font: "400 20px/1 var(--f-body)" }}>{open ? "–" : "+"}</span>
                    </button>
                    {open && <p style={{ margin: "0 0 18px", font: "400 14.5px/1.65 var(--f-body)", color: "var(--c-muted)" }}>{body}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,120px) ${GUTTER}`, display: "flex", flexDirection: "column", gap: 28 }}>
        <h2 data-reveal style={{ margin: 0, font: "400 clamp(30px,5vw,48px)/1.05 var(--f-display)" }}>Pairs well with</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(46%,240px),1fr))", gap: "clamp(24px,3vw,36px) clamp(12px,2vw,24px)" }}>
          {related.map((r) => (
            <ProductCard key={r.id} product={r} store={store} />
          ))}
        </div>
      </section>

      {!store.desktop && (
        <div style={{ position: "sticky", bottom: 0, zIndex: 30, background: "color-mix(in srgb, var(--c-bg) 96%, transparent)", backdropFilter: "blur(12px)", borderTop: "1px solid var(--c-line)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ font: "600 16px/1 var(--f-body)", whiteSpace: "nowrap" }}>{kes(p.price)}</span>
            <span style={{ font: "400 12px/1 var(--f-body)", color: "var(--c-muted)", whiteSpace: "nowrap" }}>{deposit(p)} deposit</span>
          </div>
          <button type="button" onClick={store.openMpesa} style={{ flex: 1, height: 50, borderRadius: 999, border: 0, background: BRAND_GREEN.mpesa, color: "#FFFFFF", font: "700 15px/1 var(--f-body)", cursor: "pointer" }}>
            Pay with M-Pesa
          </button>
        </div>
      )}
    </>
  );
}
