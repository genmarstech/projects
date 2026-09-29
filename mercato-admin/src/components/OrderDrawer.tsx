import { useEffect } from "react";
import { Chip } from "./ui";
import { FLOW, STATUS_COLOR, byId, money, photo } from "../data";
import { c, font, r } from "../theme";
import type { Order } from "../types";
import type { Store } from "../useStore";

/**
 * The order slide-over: who, what, where it is in the pipeline, and the two
 * buttons that move it.
 *
 * ── IT STAYS MOUNTED WHEN CLOSED ───────────────────────────────────────
 *
 * Rendering `null` would make the panel vanish rather than slide out, and
 * would also empty its contents mid-animation. So it renders the last order
 * that was opened and translates off-screen, with `inert` and
 * `aria-hidden` set so a closed drawer is not reachable by tab or by a
 * screen reader.
 */
export function OrderDrawer({ store }: { store: Store }) {
  const open = store.openId !== null;
  const order = store.orders.find((o) => o.id === store.lastId) ?? store.orders[0];

  // Escape closes it, which is what every drawer on the internet does and
  // the only way out for somebody not using a mouse.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") store.closeOrder();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, store]);

  if (!order) return null;

  const label = store.displayStatus(order);
  const [sBg, sFg] = STATUS_COLOR[label] ?? STATUS_COLOR.New;
  const index = FLOW.indexOf(order.status);
  const cancelled = order.status === "Cancelled";
  const finished = cancelled || index >= FLOW.length - 1;
  const picked = order.lines.filter((l) => l.picked).length;

  const nextLabels = order.mode === "Pickup"
    ? ["Start picking", "Mark packed", "Ready for pickup", "Mark collected", "Completed"]
    : ["Start picking", "Mark packed", "Hand to driver", "Mark delivered", "Completed"];

  return (
    <>
      <div
        onClick={store.closeOrder}
        aria-hidden
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(10,20,16,.45)", backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity .4s",
        }}
      />
      <aside
        aria-label={`Order ${order.no}`}
        aria-hidden={!open}
        {...(!open ? { inert: "" as unknown as boolean } : {})}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 91,
          width: "min(500px,100vw)", background: c.cream,
          display: "flex", flexDirection: "column",
          transform: open ? "none" : "translateX(105%)",
          transition: "transform .55s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "-30px 0 60px -30px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `1px solid ${c.line}`, gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: c.muted }}>
              {order.mode} · {order.slot}
            </span>
            <span style={{ fontFamily: font.display, fontSize: 36, lineHeight: 1 }}>{order.no}</span>
            <Chip bg={sBg} fg={sFg} style={{ alignSelf: "flex-start" }}>{label}</Chip>
          </div>
          <button
            type="button"
            onClick={store.closeOrder}
            aria-label="Close order"
            style={{ width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${c.ink}`, background: "transparent", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {FLOW.map((step, i) => {
              const text = order.mode === "Pickup" && i === 3 ? "Ready"
                : order.mode === "Pickup" && i === 4 ? "Collected"
                : i === 3 ? "Out" : step;
              return (
                <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div
                    style={{
                      height: 5, borderRadius: 5,
                      background: cancelled ? c.fullBorder : i <= index ? c.forest : c.track,
                      transition: "background .5s",
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 800, color: i <= index && !cancelled ? c.ink : c.faint }}>
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ background: c.panel, border: `1px solid ${c.lineCard}`, borderRadius: r.box, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontWeight: 800 }}>{order.customer}</span>
            <span style={{ fontSize: 14, color: c.muted }}>{order.address}</span>
            <span style={{ fontSize: 14, color: c.muted }}>{order.phone}</span>
            {order.note ? (
              <span style={{ marginTop: 8, fontSize: 14, background: c.newBg, borderRadius: 10, padding: "8px 10px" }}>
                “{order.note}”
              </span>
            ) : null}
          </div>

          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 14 }}>
            Assigned shopper
            <select
              value={order.shopper}
              onChange={(e) => store.assignShopper(order.id, e.target.value)}
              style={{ height: 40, borderRadius: r.pill, border: `1.5px solid ${c.lineInput}`, background: c.white, padding: "0 12px", fontWeight: 700, color: c.ink }}
            >
              <option value="">Unassigned</option>
              {store.team.filter((t) => t.on).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: c.muted, marginBottom: 6 }}>
              Pick list · {picked} of {order.lines.length} picked
            </span>
            {order.lines.map((l, i) => {
              const p = byId[l.id];
              return (
                <button
                  key={l.id + i}
                  type="button"
                  onClick={() => store.toggleLine(order.id, i)}
                  aria-pressed={l.picked}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", border: 0, borderBottom: `1px solid ${c.lineSoft}`, background: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${c.forest}`,
                      background: l.picked ? c.forest : "transparent", color: c.cream,
                      display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0,
                    }}
                  >
                    {l.picked ? "✓" : ""}
                  </span>
                  <img src={photo(p.img)} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover" }} />
                  <span
                    style={{
                      flex: 1, fontWeight: 700, fontSize: 14,
                      textDecoration: l.picked ? "line-through" : "none",
                      color: l.picked ? c.muted : c.ink,
                    }}
                  >
                    {l.qty} × {p.name}
                  </span>
                  <span style={{ fontSize: 14 }}>{money(p.price * l.qty)}</span>
                </button>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, fontWeight: 800 }}>
              <span>Total</span>
              <span>{money(store.total(order))}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "18px 24px 24px", borderTop: `1px solid ${c.line}`, display: "flex", gap: 10, flexWrap: "wrap", background: c.panel }}>
          <button
            type="button"
            onClick={() => store.cancelOrder(order)}
            style={{ height: 52, padding: "0 18px", borderRadius: r.pill, border: `1.5px solid ${c.badDeep}`, background: "transparent", color: c.badDeep, fontWeight: 800, cursor: "pointer" }}
          >
            {cancelled ? "Restore" : "Cancel & refund"}
          </button>
          <button
            type="button"
            onClick={() => store.advance(order)}
            disabled={finished}
            style={{
              flex: 1, height: 52, borderRadius: r.pill, border: 0,
              background: finished ? c.faint : c.forest, color: c.cream,
              fontWeight: 800, fontSize: 15,
              cursor: finished ? "default" : "pointer",
            }}
          >
            {cancelled ? "Cancelled" : nextLabels[Math.max(0, index)]}
          </button>
        </div>
      </aside>
    </>
  );
}

/** Kept for the type of `order` above without importing it unused elsewhere. */
export type { Order };
