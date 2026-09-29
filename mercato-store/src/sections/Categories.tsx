import { c, ease, revealFrom } from "../theme";
import { CATEGORIES, PRODUCTS, photo } from "../data";
import { SectionHeading } from "../components/ui";
import type { StoreApi } from "../useStore";

/**
 * The seven departments, as circles.
 *
 * The item count under each is counted from the catalogue rather than typed
 * in, because a hand-written "12 items" is wrong the first time somebody adds
 * a product and nothing ever notices.
 */
const count = (name: string) => {
  const n = PRODUCTS.filter((p) => p.cat === name).length;
  return `${n} ${n === 1 ? "item" : "items"}`;
};

export function Categories({ s }: { s: StoreApi }) {
  return (
    <section
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "clamp(64px,8vw,120px) clamp(16px,3vw,40px) clamp(32px,4vw,56px)",
      }}
    >
      <div
        data-reveal="0ms"
        style={{
          ...revealFrom,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 24,
          flexWrap: "wrap",
          marginBottom: 44,
        }}
      >
        <SectionHeading before="Shop the" accent="aisles" />
        <p
          style={{
            margin: 0,
            maxWidth: 360,
            color: c.muted,
            fontSize: 16,
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          Seven departments, restocked before 6am every morning from 40+ local growers and makers.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
          gap: "24px 20px",
        }}
      >
        {CATEGORIES.map(([name, img], i) => (
          <button
            key={name}
            type="button"
            className="catTile"
            onClick={() => s.goShop(name, true)}
            data-reveal={`${i * 70}ms`}
            style={{
              ...revealFrom,
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              className="catTileArt"
              style={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "50%",
                overflow: "hidden",
                background: c.lineCard,
                transition: `transform .6s ${ease.travel}`,
              }}
            >
              <img
                src={photo(img, 500)}
                alt=""
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
            >
              <span style={{ fontWeight: 800, fontSize: 16 }}>{name}</span>
              <span style={{ fontSize: 13, color: c.muted }}>
                {/* Meat has one product, and "1 items" is the kind of thing a
                    visitor notices and a shop never does. */}
                {count(name)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
