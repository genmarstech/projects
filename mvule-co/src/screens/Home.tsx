import { BRAND_NAME, FREE_DELIVERY_FROM } from "../config";
import {
  CATEGORIES, CATEGORY_SHOTS, CRAFT_FACTS, INSTAGRAM_SHOTS, PRODUCTS, REVIEWS,
  ROOMS, TILE_TONES, TRUST, ZONES, kes, px,
} from "../data";
import { BRAND_GREEN } from "../theme";
import { wa, type StoreApi } from "../useStore";
import { ProductCard } from "../components/ProductCard";
import { GUTTER, SectionHead, Shot } from "../components/ui";

const section = (top = "clamp(64px,10vw,120px)"): React.CSSProperties => ({
  maxWidth: 1280,
  margin: "0 auto",
  padding: `${top} ${GUTTER} 0`,
  display: "flex",
  flexDirection: "column",
  gap: 32,
});

export function Home({ store }: { store: StoreApi }) {
  const bestsellers = [...PRODUCTS.filter((p) => p.best), ...PRODUCTS.filter((p) => !p.best)].slice(0, 6);
  const railCol = store.desktop ? "calc((100% - 3 * 24px) / 4)" : store.width >= 700 ? "calc((100% - 2 * 20px) / 2.6)" : "72%";
  const reviewCol = store.desktop ? "calc((100% - 3 * 16px) / 4)" : store.width >= 700 ? "46%" : "84%";

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "min(88svh,860px)",
          paddingTop: 96,
          display: "flex",
          alignItems: "flex-end",
          background: "linear-gradient(160deg,#6B4A33,#2B1D14)",
          color: "#F7EFE3",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Shot
            src={px(6636320, 2000)}
            alt="A furnished apartment living room in daylight, sofa and low table facing a media wall"
            tone="#6B4A33"
            loading="eager"
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "linear-gradient(180deg,rgba(20,14,10,.35) 0%,rgba(20,14,10,.25) 35%,rgba(20,14,10,.8) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1280,
            margin: "0 auto",
            padding: `0 ${GUTTER} clamp(32px,7vw,88px)`,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase" }}>
            Handcrafted in Nairobi · Since 2014
          </span>
          <h1 style={{ margin: 0, font: "400 clamp(46px,10.5vw,120px)/.98 var(--f-display)", letterSpacing: "-.015em", maxWidth: "12ch", textWrap: "balance" }}>
            Made in Nairobi. Made to stay.
          </h1>
          <p style={{ margin: 0, maxWidth: "44ch", font: "400 clamp(16px,2vw,19px)/1.55 var(--f-body)", color: "#F1E6D6", textWrap: "pretty" }}>
            Solid mvule and mahogany furniture, built by hand in our Kariobangi workshop and styled for real Kenyan
            homes.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            <a
              className="btnLight"
              href="#"
              onClick={(e) => { e.preventDefault(); store.go("shop", { cat: "All" }); }}
              style={{ height: 54, padding: "0 28px", borderRadius: 999, background: "#F7EFE3", color: "#221D18", display: "inline-flex", alignItems: "center", gap: 10, font: "600 15px/1 var(--f-body)" }}
            >
              Shop the collection <span aria-hidden>→</span>
            </a>
            <a
              className="waBtn"
              href={wa(`Hi ${BRAND_NAME}! I found you online and would like to ask about your furniture.`)}
              target="_blank"
              rel="noreferrer"
              style={{ height: 54, padding: "0 24px", borderRadius: 999, background: BRAND_GREEN.whatsapp, color: BRAND_GREEN.whatsappInk, display: "inline-flex", alignItems: "center", gap: 10, font: "700 15px/1 var(--f-body)" }}
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── trust strip ──────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--c-line)" }}>
        <div className="rail" style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${GUTTER}`, display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(210px,1fr)" }}>
          {TRUST.map((t) => (
            <div key={t.title} style={{ padding: "22px 20px 22px 0", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "400 19px/1.2 var(--f-display)" }}>{t.title}</span>
              <span style={{ font: "400 13px/1.45 var(--f-body)", color: "var(--c-muted)" }}>{t.body}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── categories ───────────────────────────────────────────────────── */}
      <section style={section()}>
        <div data-reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <SectionHead eyebrow="Shop by room" title="Something for every corner" />
          <a href="#" onClick={(e) => { e.preventDefault(); store.go("shop", { cat: "All" }); }} style={{ font: "600 14px/1 var(--f-body)", borderBottom: "1px solid currentColor", paddingBottom: 4 }}>
            View all pieces →
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "clamp(10px,1.6vw,18px)" }}>
          {CATEGORIES.map((c, i) => {
            const count = PRODUCTS.filter((p) => p.cat === c).length;
            return (
              <button
                key={c}
                type="button"
                data-reveal
                className="catTile"
                onClick={() => store.go("shop", { cat: c })}
                style={{ position: "relative", aspectRatio: "3/4", borderRadius: 4, overflow: "hidden", cursor: "pointer", background: TILE_TONES[i], border: 0, padding: 0 }}
              >
                <Shot src={px(CATEGORY_SHOTS[i]!, 700)} alt={`${c} — ${count} pieces`} tone={TILE_TONES[i]!} />
                <div
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    padding: "40px 14px 14px",
                    background: "linear-gradient(180deg,rgba(20,14,10,0),rgba(20,14,10,.62))",
                    color: "#F7EFE3",
                    pointerEvents: "none",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ font: "400 22px/1 var(--f-display)" }}>{c}</span>
                  <span style={{ font: "500 12px/1 var(--f-body)" }}>
                    {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── bestsellers ──────────────────────────────────────────────────── */}
      <section style={{ ...section(), padding: `clamp(64px,10vw,120px) 0 0` }}>
        <div data-reveal style={{ padding: `0 ${GUTTER}`, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <SectionHead eyebrow="Bestsellers" title="Loved in Nairobi homes" />
          <a href="#" onClick={(e) => { e.preventDefault(); store.go("shop", { cat: "All" }); }} style={{ font: "600 14px/1 var(--f-body)", borderBottom: "1px solid currentColor", paddingBottom: 4 }}>
            Shop all →
          </a>
        </div>
        <div
          className="rail"
          style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: railCol, gap: "clamp(14px,2vw,24px)", scrollSnapType: "x mandatory", padding: `0 ${GUTTER}`, scrollPadding: `0 ${GUTTER}` }}
        >
          {bestsellers.map((p) => (
            <div key={p.id} style={{ scrollSnapAlign: "start" }}>
              <ProductCard product={p} store={store} />
            </div>
          ))}
        </div>
      </section>

      {/* ── craftsmanship ────────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: "clamp(72px,11vw,140px)",
          backgroundColor: "var(--c-wood)",
          backgroundImage:
            "repeating-radial-gradient(ellipse 160% 14% at 20% 50%,rgba(255,236,210,.04) 0 2px,transparent 2px 11px),linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.28))",
          color: "#F7EFE3",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,128px) ${GUTTER}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(36px,6vw,88px)", alignItems: "center" }}>
          <div data-reveal style={{ position: "relative", aspectRatio: "4/5", borderRadius: 4, overflow: "hidden", background: "#6E4630" }}>
            <Shot src={px(27520661, 1400)} alt="A craftsman planing a timber slab at a workbench" tone="#6E4630" />
          </div>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "#E3B58F" }}>
              Made in Kenya
            </span>
            <h2 style={{ margin: 0, font: "400 clamp(36px,6vw,64px)/1.02 var(--f-display)", letterSpacing: "-.01em", textWrap: "balance" }}>
              Every piece starts as a slab of mvule in our workshop.
            </h2>
            <p style={{ margin: 0, font: "400 17px/1.65 var(--f-body)", color: "#EADCC8", maxWidth: "52ch", textWrap: "pretty" }}>
              Our fundis have been joining, carving and upholstering for decades. We use slow-grown Kenyan hardwoods,
              sisal from Taita and kikoy cotton from the coast — then finish each piece by hand, so it can be passed
              down, not thrown out.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16, padding: "24px 0", borderTop: "1px solid rgba(247,239,227,.2)", borderBottom: "1px solid rgba(247,239,227,.2)" }}>
              {CRAFT_FACTS.map((f) => (
                <div key={f.l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ font: "400 clamp(28px,4vw,40px)/1 var(--f-display)" }}>{f.n}</span>
                  <span style={{ font: "400 13px/1.4 var(--f-body)", color: "#EADCC8" }}>{f.l}</span>
                </div>
              ))}
            </div>
            <a
              className="btnOnDark"
              href="#"
              onClick={(e) => { e.preventDefault(); store.go("about"); }}
              style={{ alignSelf: "flex-start", height: 52, padding: "0 26px", borderRadius: 999, border: "1px solid #F7EFE3", color: "#F7EFE3", display: "inline-flex", alignItems: "center", gap: 10, font: "600 15px/1 var(--f-body)" }}
            >
              Meet the workshop →
            </a>
          </div>
        </div>
      </section>

      {/* ── rooms ────────────────────────────────────────────────────────── */}
      <section style={section("clamp(64px,10vw,128px)")}>
        <SectionHead eyebrow="Room inspiration" title="Real homes, styled by us">
          <p style={{ margin: 0, font: "400 16px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: 640 }}>
            From two-bedroom rentals in Kilimani to family homes in Syokimani — tap a room to shop the pieces.
          </p>
        </SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "clamp(12px,2vw,20px)" }}>
          {ROOMS.map((r) => (
            <button
              key={r.name}
              type="button"
              data-reveal
              onClick={() => store.go("shop", { cat: r.cat })}
              style={{ position: "relative", aspectRatio: "4/5", borderRadius: 4, overflow: "hidden", cursor: "pointer", background: r.tone, border: 0, padding: 0 }}
            >
              <Shot src={px(r.img, 1200)} alt={`${r.name} — ${r.meta}`} tone={r.tone} />
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, padding: "14px 16px", borderRadius: 4, background: "color-mix(in srgb, var(--c-bg) 94%, transparent)", color: "var(--c-ink)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, pointerEvents: "none" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={{ font: "400 19px/1.1 var(--f-display)" }}>{r.name}</span>
                  <span style={{ font: "400 12.5px/1.3 var(--f-body)", color: "var(--c-muted)" }}>{r.meta}</span>
                </div>
                <span style={{ font: "600 13px/1 var(--f-body)", whiteSpace: "nowrap" }}>Shop →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── reviews ──────────────────────────────────────────────────────── */}
      <section style={{ ...section("clamp(64px,10vw,128px)"), padding: "clamp(64px,10vw,128px) 0 0" }}>
        <div data-reveal style={{ padding: `0 ${GUTTER}`, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <SectionHead eyebrow="Reviews" title="4.9 from 600+ homes" />
          <span style={{ font: "500 14px/1 var(--f-body)", color: "var(--c-muted)" }}>Google &amp; Instagram reviews</span>
        </div>
        <div className="rail" style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: reviewCol, gap: 16, scrollSnapType: "x mandatory", padding: `0 ${GUTTER}`, scrollPadding: `0 ${GUTTER}` }}>
          {REVIEWS.map((r) => (
            <figure key={r.name} style={{ margin: 0, scrollSnapAlign: "start", padding: "28px 24px", borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 20, justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span aria-label="Five stars" style={{ color: "var(--c-accent)", letterSpacing: 3, fontSize: 14 }}>★★★★★</span>
                <blockquote style={{ margin: 0, font: "400 20px/1.4 var(--f-display)", textWrap: "pretty" }}>“{r.text}”</blockquote>
              </div>
              <figcaption style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 16, borderTop: "1px solid var(--c-line)" }}>
                <span style={{ font: "600 14px/1.2 var(--f-body)" }}>{r.name}</span>
                <span style={{ font: "400 13px/1.3 var(--f-body)", color: "var(--c-muted)" }}>{r.meta}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── delivery ─────────────────────────────────────────────────────── */}
      <section
        style={{
          marginTop: "clamp(72px,11vw,140px)",
          backgroundColor: "var(--c-surface)",
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(34,29,24,.03) 0 2px,transparent 2px 9px),repeating-linear-gradient(-45deg,rgba(34,29,24,.03) 0 2px,transparent 2px 9px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,120px) ${GUTTER}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(36px,6vw,80px)" }}>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <SectionHead eyebrow="Delivery" title="From our workshop to your door" />
            <p style={{ margin: 0, font: "400 16px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: "46ch" }}>
              Free delivery and assembly within Nairobi on orders over {kes(FREE_DELIVERY_FROM)}. Countrywide delivery
              via trusted courier partners, fully insured and tracked on WhatsApp.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: 4, background: "var(--c-bg)", marginTop: 6 }}>
              <span style={{ font: "600 14px/1.3 var(--f-body)" }}>Lipa pole pole</span>
              <span style={{ font: "400 14px/1.55 var(--f-body)", color: "var(--c-muted)" }}>
                Reserve any piece with a 40% M-Pesa deposit and clear the balance before delivery — no interest, no
                paperwork.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {ZONES.map((z) => (
              <div key={z.name} data-reveal style={{ padding: "22px 0", borderTop: "1px solid var(--c-line)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "6px 20px", alignItems: "baseline" }}>
                <span style={{ font: "400 22px/1.2 var(--f-display)" }}>{z.name}</span>
                <span style={{ font: "600 14px/1 var(--f-body)", color: "var(--c-accent)", whiteSpace: "nowrap" }}>{z.days}</span>
                <span style={{ font: "400 14px/1.5 var(--f-body)", color: "var(--c-muted)" }}>{z.areas.join(", ")}</span>
                <span style={{ font: "500 13px/1.4 var(--f-body)", textAlign: "right" }}>
                  {z.fee === "free" ? `Free over ${kes(FREE_DELIVERY_FROM)}` : z.fee}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── instagram ────────────────────────────────────────────────────── */}
      <section style={{ ...section(), paddingBottom: "clamp(64px,10vw,120px)", gap: 28 }}>
        <div data-reveal style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <SectionHead
            eyebrow={`@${BRAND_NAME.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "")}`}
            title="Tag us in your space"
            size="clamp(30px,5vw,48px)"
          />
          <div style={{ display: "flex", gap: 10 }}>
            {[["Instagram", "https://instagram.com"], ["TikTok", "https://tiktok.com"]].map(([label, href]) => (
              <a key={label} className="btnOutline" href={href} target="_blank" rel="noreferrer" style={{ height: 44, padding: "0 18px", borderRadius: 999, border: "1px solid var(--c-ink)", display: "inline-flex", alignItems: "center", font: "600 13px/1 var(--f-body)" }}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
          {INSTAGRAM_SHOTS.map((id, i) => (
            <div key={id} data-reveal style={{ position: "relative", aspectRatio: "1", borderRadius: 3, overflow: "hidden", background: TILE_TONES[i % TILE_TONES.length] }}>
              <Shot src={px(id, 600)} alt="A piece of furniture in a customer's home" tone={TILE_TONES[i % TILE_TONES.length]!} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
