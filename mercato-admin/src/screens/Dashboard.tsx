import { useMemo } from "react";
import { Card, Chip, Figure, Meter, Avatar } from "../components/ui";
import { FLOW, HOURS, REVENUE, STATUS_COLOR, byId, initials, money, photo } from "../data";
import { c, font, r } from "../theme";
import type { Order, Range } from "../types";
import { ago, isLow, stockState, type Store } from "../useStore";

const PIPE_COLORS = ["#F2B135", "#8FC79A", "#9CC0E0", "#FF7A5C"];

export function Dashboard({ store }: { store: Store }) {
  const { orders, products, range } = store;

  const derived = useMemo(() => {
    const active = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));
    const low = products.filter(isLow);

    const counts: Record<string, number> = Object.fromEntries(
      ["All", ...FLOW, "Cancelled"].map((k) => [
        k,
        k === "All" ? orders.length : orders.filter((o) => o.status === k).length,
      ]),
    );

    // The +3860 and +118 are the day's takings before this session started —
    // without them the dashboard reads as a shop that opened five minutes ago.
    const revenue =
      orders.filter((o) => o.status !== "Cancelled").reduce((a, o) => a + store.total(o), 0) + 3860;
    const orderCount = orders.length + 118;

    const base = REVENUE[range];
    const max = Math.max(...base);
    // Hours run 7am–9pm, so index 0 is 7am.
    const currentHour = Math.max(0, Math.min(14, new Date().getHours() - 7));

    const bars = base.map((v, i) => ({
      label: HOURS[i],
      height: (v / max) * 100 + "%",
      value: v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v),
      // Only the peak and the current hour are labelled; fifteen numbers
      // above fifteen bars is a wall.
      labelled: i === currentHour || v === max,
      color:
        range === "Today" && i > currentHour
          ? c.track
          : i === currentHour && range === "Today"
            ? c.tomato
            : c.forest,
    }));

    const pipeMax = Math.max(1, ...FLOW.slice(0, 4).map((k) => counts[k]));

    return { active, low, counts, revenue, orderCount, bars, pipeMax };
  }, [orders, products, range, store]);

  const { active, low, counts, revenue, orderCount, bars, pipeMax } = derived;

  const kpis = [
    { label: "Revenue today", value: "$" + Math.round(revenue).toLocaleString(), delta: "↑ 12.4% vs last Sunday", bg: c.forest, fg: c.cream },
    { label: "Orders", value: String(orderCount), delta: active.length + " in progress", bg: c.amber, fg: c.ink },
    { label: "Avg basket", value: money(revenue / orderCount), delta: "↑ $3.10 this week", bg: c.panel, fg: c.ink },
    { label: "On-time rate", value: "96.8%", delta: "2 late slots today", bg: c.tomato, fg: c.onTomato },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: k.bg, color: k.fg, borderRadius: r.card, padding: 22,
              display: "flex", flexDirection: "column", gap: 10, minHeight: 150,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.8 }}>
              {k.label}
            </span>
            <Figure>{k.value}</Figure>
            <span style={{ fontSize: 13, fontWeight: 700, marginTop: "auto" }}>{k.delta}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16 }}>
        <Card style={{ gap: 18, gridColumn: "span 2", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Revenue by hour</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {(["Today", "Week", "Month"] as Range[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => store.setRange(t)}
                  aria-pressed={range === t}
                  style={{
                    height: 32, padding: "0 12px", borderRadius: r.pill,
                    border: `1.5px solid ${c.ink}`,
                    background: range === t ? c.ink : "transparent",
                    color: range === t ? c.cream : c.ink,
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 220, paddingTop: 12, borderBottom: `1px solid ${c.line}` }}>
            {bars.map((b, i) => (
              <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: c.muted, opacity: b.labelled ? 1 : 0 }}>
                  {b.value}
                </span>
                <div
                  style={{
                    width: "100%", maxWidth: 34, height: b.height, background: b.color,
                    borderRadius: "8px 8px 3px 3px",
                    transition: "height .9s cubic-bezier(.2,.7,.2,1)",
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {bars.map((b, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: c.muted, fontWeight: 700, minWidth: 0 }}>
                {b.label}
              </span>
            ))}
          </div>
        </Card>

        <section style={{ background: c.ink, color: c.cream, borderRadius: r.card, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Fulfilment pipeline</h2>
          {FLOW.slice(0, 4).map((k, i) => (
            <button
              key={k}
              type="button"
              onClick={() => { store.setSection("orders"); store.setOrderFilter(k); }}
              style={{ display: "flex", flexDirection: "column", gap: 6, background: "none", border: 0, padding: 0, cursor: "pointer", color: c.cream, textAlign: "left" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                <span>{k}</span>
                <Figure size={20}>{counts[k]}</Figure>
              </div>
              <Meter pct={(counts[k] / pipeMax) * 100 + "%"} color={PIPE_COLORS[i]} track="rgba(244,238,225,.12)" />
            </button>
          ))}
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Live orders</h2>
            <button type="button" onClick={() => store.setSection("orders")} style={{ background: "none", border: 0, cursor: "pointer", fontWeight: 800, fontSize: 13, color: c.forest }}>
              All orders →
            </button>
          </div>
          {active.slice(0, 6).map((o) => (
            <LiveRow key={o.id} order={o} store={store} />
          ))}
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Low stock</h2>
            <button type="button" onClick={store.restockAllLow} style={{ height: 32, padding: "0 12px", borderRadius: r.pill, border: 0, background: c.tomato, color: c.onTomato, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
              Reorder all
            </button>
          </div>
          {low.length === 0 ? (
            <span style={{ fontSize: 14, color: c.muted, padding: "16px 0" }}>Every shelf is stocked.</span>
          ) : (
            low.slice(0, 5).map((p) => {
              const st = stockState(p);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${c.lineSoft}` }}>
                  <img src={photo(p.img)} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: st[2], fontWeight: 700 }}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left · par ${p.par}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { store.restock(p.id); store.say(p.name + " restocked +24"); }}
                    style={{ height: 32, padding: "0 12px", borderRadius: r.pill, border: `1.5px solid ${c.ink}`, background: "transparent", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
                  >
                    +24
                  </button>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>Top sellers today</h2>
          {["ban", "avo", "sdo", "mlk", "cbw"].map((id, i) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${c.lineSoft}` }}>
              <span style={{ fontFamily: font.display, fontSize: 20, width: 22, color: c.faint }}>{i + 1}</span>
              <img src={photo(byId[id].img)} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
              <span style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>{byId[id].name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>
                {[142, 118, 96, 88, 74][i]} sold
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function LiveRow({ order, store }: { order: Order; store: Store }) {
  const label = store.displayStatus(order);
  const [bg, fg] = STATUS_COLOR[label] ?? STATUS_COLOR.New;
  const items = order.lines.reduce((a, l) => a + l.qty, 0);
  return (
    <button
      type="button"
      onClick={() => store.openOrder(order.id)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
        border: 0, borderBottom: `1px solid ${c.lineSoft}`, background: "none",
        cursor: "pointer", textAlign: "left",
        animation: order.fresh ? "mcIn .6s ease" : "none",
      }}
    >
      <Avatar>{initials(order.customer)}</Avatar>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>{order.customer}</span>
        <span style={{ fontSize: 12, color: c.muted }}>
          {order.no} · {items} items · {ago(order.minsAgo)}
        </span>
      </div>
      <Chip bg={bg} fg={fg}>{label}</Chip>
    </button>
  );
}
