import { useMemo } from "react";
import { Chip, Meter, Scroller, Switch, Tab, TableHead } from "../components/ui";
import { photo } from "../data";
import { c, r } from "../theme";
import { isLow, stockState, type Store } from "../useStore";

const COLS = "2.2fr 1fr 1fr 2fr 1fr .8fr";

export function Inventory({ store }: { store: Store }) {
  const { products, invFilter, query } = store;
  const q = query.trim().toLowerCase();

  const { rows, tabs } = useMemo(() => {
    const low = products.filter(isLow);
    const tabs: [string, number][] = [
      ["All", products.length],
      ["Low", low.filter((p) => p.stock > 0).length],
      ["Out", products.filter((p) => p.stock === 0).length],
      ["Unlisted", products.filter((p) => !p.active).length],
    ];
    const rows = products.filter((p) => {
      const matchesTab =
        invFilter === "All" ||
        (invFilter === "Low" && p.stock > 0 && isLow(p)) ||
        (invFilter === "Out" && p.stock === 0) ||
        (invFilter === "Unlisted" && !p.active);
      const matchesQuery = !q || (p.name + p.sku + p.cat).toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
    return { rows, tabs };
  }, [products, invFilter, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map(([k, n]) => (
            <Tab key={k} label={k} active={invFilter === k} onClick={() => store.setInvFilter(k)} count={n} />
          ))}
        </div>
        <button
          type="button"
          onClick={store.restockAllLow}
          style={{
            height: 40, padding: "0 18px", borderRadius: r.pill, border: 0,
            background: c.forest, color: c.cream, fontWeight: 800,
            fontSize: 13, cursor: "pointer",
          }}
        >
          Reorder all low stock
        </button>
      </div>

      <Scroller minWidth={900}>
        <TableHead cols={COLS} labels={["Product", "Department", "Price", "Stock on hand", "Status", "Listed"]} />
        {rows.map((p) => {
          const [label, chipBg, chipFg, barColor] = stockState(p);
          return (
            <div
              key={p.id}
              style={{
                display: "grid", gridTemplateColumns: COLS, gap: 14,
                padding: "12px 20px", alignItems: "center",
                borderBottom: `1px solid ${c.lineSoft}`, fontSize: 14,
                // An unlisted product stays visible but recedes — it is
                // still stock you own, it is just not for sale.
                opacity: p.active ? 1 : 0.5, transition: "opacity .3s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <img src={photo(p.img)} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ fontWeight: 800 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: c.muted }}>{p.sku} · {p.unit}</span>
                </div>
              </div>

              <span>{p.cat}</span>

              <div style={{ display: "flex", alignItems: "center", gap: 4, border: `1.5px solid ${c.lineInput}`, borderRadius: 10, height: 36, padding: "0 8px", background: c.white, maxWidth: 100 }}>
                <span style={{ color: c.muted }}>$</span>
                <label htmlFor={`price-${p.id}`} style={srOnly}>Price for {p.name}</label>
                <input
                  id={`price-${p.id}`}
                  value={p.price.toFixed(2)}
                  onChange={(e) => store.setPrice(p.id, parseFloat(e.target.value))}
                  inputMode="decimal"
                  style={{ width: "100%", border: 0, outline: "none", fontWeight: 800, fontSize: 14, background: "transparent", color: c.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => store.adjustStock(p.id, -1)}
                  aria-label={`One fewer ${p.name}`}
                  style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${c.ink}`, background: "transparent", cursor: "pointer" }}
                >
                  –
                </button>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 60 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>
                    {p.stock} <span style={{ color: c.muted, fontWeight: 600 }}>/ par {p.par}</span>
                  </span>
                  <Meter pct={Math.min(100, (p.stock / p.par) * 100) + "%"} color={barColor} />
                </div>
                <button
                  type="button"
                  onClick={() => store.restock(p.id)}
                  style={{ height: 30, padding: "0 10px", borderRadius: r.pill, border: 0, background: c.ink, color: c.cream, fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                >
                  +24
                </button>
              </div>

              <span><Chip bg={chipBg} fg={chipFg}>{label}</Chip></span>

              <Switch on={p.active} onClick={() => store.toggleListed(p.id)} label={`List ${p.name} on the storefront`} />
            </div>
          );
        })}
      </Scroller>
    </div>
  );
}

const srOnly = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clipPath: "inset(50%)", whiteSpace: "nowrap",
} as const;
