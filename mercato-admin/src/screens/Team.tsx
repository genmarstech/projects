import { Chip, Figure } from "../components/ui";
import { initials } from "../data";
import { c, r } from "../theme";
import type { Store } from "../useStore";

export function Team({ store }: { store: Store }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
      {store.team.map((m) => {
        // Active work is counted from the orders themselves rather than
        // tracked on the member — two places holding the same number is how
        // a roster starts lying about who is free.
        const active = store.orders.filter(
          (o) => o.shopper === m.id && !["Delivered", "Cancelled"].includes(o.status),
        ).length;
        const busy = m.on && active > 0;

        const state = !m.on ? "Off shift" : busy ? (m.role.includes("driver") ? "Driving" : "Picking") : "Available";
        const [bg, fg] = !m.on
          ? [c.doneBg, c.muted]
          : busy
            ? [c.newBg, c.newFg]
            : [c.pickBg, c.pickFg];

        return (
          <div key={m.id} style={{ background: c.panel, border: `1px solid ${c.lineCard}`, borderRadius: r.card, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span aria-hidden style={{ width: 48, height: 48, borderRadius: "50%", background: m.av, color: c.ink, display: "grid", placeItems: "center", fontWeight: 800 }}>
                {initials(m.name)}
              </span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{m.name}</span>
                <span style={{ fontSize: 13, color: c.muted }}>{m.role}</span>
              </div>
              <Chip bg={bg} fg={fg}>{state}</Chip>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, borderTop: `1px solid ${c.lineSoft}`, paddingTop: 14 }}>
              {[
                [String(active), "Active"],
                [String(m.done), "Done today"],
                [m.rating, "Rating"],
              ].map(([value, label]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <Figure size={26}>{value}</Figure>
                  <span style={{ fontSize: 11, color: c.muted, fontWeight: 700 }}>{label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => store.toggleShift(m.id)}
              style={{ height: 40, borderRadius: r.pill, border: `1.5px solid ${c.ink}`, background: "transparent", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              {m.on ? "End shift" : "Start shift"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
