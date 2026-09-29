import { useMemo } from "react";
import { Chip, Scroller, Tab, TableHead } from "../components/ui";
import { FLOW, STATUS_COLOR } from "../data";
import { c } from "../theme";
import { ago, type Store } from "../useStore";

const COLS = "1fr 1.6fr 1.3fr .9fr .7fr .9fr 1.1fr 1fr";

export function Orders({ store }: { store: Store }) {
  const { orders, orderFilter, query } = store;
  const q = query.trim().toLowerCase();

  const { rows, counts } = useMemo(() => {
    const counts: Record<string, number> = Object.fromEntries(
      ["All", ...FLOW, "Cancelled"].map((k) => [
        k,
        k === "All" ? orders.length : orders.filter((o) => o.status === k).length,
      ]),
    );
    const rows = orders.filter(
      (o) =>
        (orderFilter === "All" || o.status === orderFilter) &&
        (!q || (o.no + o.customer).toLowerCase().includes(q)),
    );
    return { rows, counts };
  }, [orders, orderFilter, q]);

  const shopperName = (id: string) => {
    const m = store.team.find((t) => t.id === id);
    return m ? m.name.split(" ")[0] : "Unassigned";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["All", ...FLOW, "Cancelled"].map((k) => (
          <Tab
            key={k}
            label={k}
            active={orderFilter === k}
            onClick={() => store.setOrderFilter(k)}
            count={counts[k]}
          />
        ))}
      </div>

      <Scroller minWidth={860}>
        <TableHead
          cols={COLS}
          labels={["Order", "Customer", "Slot", "Type", "Items", "Total", "Status", "Shopper"]}
        />
        {rows.map((o) => {
          const label = store.displayStatus(o);
          const [bg, fg] = STATUS_COLOR[label] ?? STATUS_COLOR.New;
          const items = o.lines.reduce((a, l) => a + l.qty, 0);
          return (
            <button
              key={o.id}
              type="button"
              className="row-hover"
              onClick={() => store.openOrder(o.id)}
              style={{
                width: "100%", display: "grid", gridTemplateColumns: COLS, gap: 12,
                padding: "14px 20px", alignItems: "center", border: 0,
                borderBottom: `1px solid ${c.lineSoft}`,
                // A new order is tinted so it stands out in a long table
                // without needing the eye to find its status chip.
                background: o.status === "New" ? c.rowNew : "transparent",
                cursor: "pointer", textAlign: "left", fontSize: 14,
                transition: "background .2s",
                animation: o.fresh ? "mcIn .6s ease" : "none",
              }}
            >
              <span style={{ fontWeight: 800 }}>{o.no}</span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontWeight: 700 }}>{o.customer}</span>
                <span style={{ fontSize: 12, color: c.muted }}>{ago(o.minsAgo)}</span>
              </span>
              <span>{o.slot}</span>
              <span>{o.mode}</span>
              <span>{items}</span>
              <span style={{ fontWeight: 800 }}>${store.total(o).toFixed(2)}</span>
              <span><Chip bg={bg} fg={fg}>{label}</Chip></span>
              <span style={{ color: o.shopper ? c.ink : c.badDeep, fontWeight: 700 }}>
                {shopperName(o.shopper)}
              </span>
            </button>
          );
        })}
        {rows.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: c.muted }}>No orders match.</div>
        ) : null}
      </Scroller>
    </div>
  );
}
