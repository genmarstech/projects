import { c, revealFrom } from "../theme";
import { BEST, BY } from "../data";
import { Pill, ProductCard, SectionHeading } from "../components/ui";
import type { StoreApi } from "../useStore";

/** The tabs, in the order the design lists them. */
const TABS = ["All", "Produce", "Bakery", "Dairy", "Drinks"];

/** Eight cards fill two rows at every column count the grid produces. */
const SHOWN = 8;

export function BestSellers({ s }: { s: StoreApi }) {
  const list = BEST.flatMap((id) => (BY[id] ? [BY[id]] : []))
    .filter((p) => s.bestTab === "All" || p.cat === s.bestTab)
    .slice(0, SHOWN);

  return (
    <section
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "clamp(64px,8vw,120px) clamp(16px,3vw,40px)",
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
          marginBottom: 32,
        }}
      >
        <SectionHeading before="Best" accent="sellers" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <Pill
              key={t}
              label={t}
              on={s.bestTab === t}
              onClick={() => s.setBestTab(t)}
              height={40}
            />
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p style={{ margin: 0, color: c.muted, fontSize: 16 }}>
          Nothing from this department is in the top twelve this week.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
            gap: 20,
          }}
        >
          {list.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              qty={s.qty(p.id)}
              variant="best"
              // Staggered by column, not by index: a row of four appearing
              // 0/90/180/270ms apart reads as a sweep; staggering all eight
              // leaves the last card arriving most of a second late.
              delay={`${(i % 4) * 90}ms`}
              fav={!!s.favs[p.id]}
              onFav={() => s.toggleFav(p.id)}
              onOpen={() => s.openProduct(p.id)}
              onAdd={() => s.add(p.id)}
              onInc={() => s.setQty(p.id, s.qty(p.id) + 1)}
              onDec={() => s.setQty(p.id, s.qty(p.id) - 1)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
