import { Avatar, Chip, Scroller, TableHead } from "../components/ui";
import { NAMES, initials } from "../data";
import { c } from "../theme";
import type { Store } from "../useStore";

const COLS = "2fr 1fr 1fr 1.2fr 1fr";

/** Order counts and last-seen, fixed per customer so the table is stable. */
const ORDER_COUNTS = [42, 3, 18, 1, 27, 9, 64, 2, 12, 33, 6, 21];
const LAST_SEEN = [
  "Today", "Today", "Yesterday", "Today", "3 days ago", "Last week",
  "Today", "Yesterday", "2 days ago", "Today", "Last week", "Yesterday",
];

/** Segment thresholds, from the design. VIP at 30+, New at 2 or fewer. */
function segment(orders: number): [string, string, string] {
  if (orders >= 30) return ["VIP", c.forest, c.cream];
  if (orders >= 10) return ["Regular", c.pickBg, c.pickFg];
  if (orders <= 2) return ["New", c.newBg, c.newFg];
  return ["Occasional", c.doneBg, c.doneFg];
}

export function Customers({ store }: { store: Store }) {
  const q = store.query.trim().toLowerCase();
  const rows = NAMES.slice(0, 12)
    .map((name, i) => ({ name, i }))
    .filter(({ name }) => !q || name.toLowerCase().includes(q));

  return (
    <Scroller minWidth={760}>
      <TableHead cols={COLS} labels={["Customer", "Orders", "Lifetime", "Last order", "Segment"]} />
      {rows.map(({ name, i }) => {
        const orders = ORDER_COUNTS[i];
        const [label, bg, fg] = segment(orders);
        return (
          <div
            key={name}
            style={{
              display: "grid", gridTemplateColumns: COLS, gap: 12,
              padding: "14px 20px", alignItems: "center",
              borderBottom: `1px solid ${c.lineSoft}`, fontSize: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <Avatar size={36}>{initials(name)}</Avatar>
              <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontWeight: 800 }}>{name}</span>
                <span style={{ fontSize: 12, color: c.muted }}>
                  {name.toLowerCase().replace(" ", ".")}@mail.com
                </span>
              </div>
            </div>
            <span style={{ fontWeight: 700 }}>{orders}</span>
            <span style={{ fontWeight: 800 }}>${(orders * 78.4).toFixed(0)}</span>
            <span>{LAST_SEEN[i]}</span>
            <span><Chip bg={bg} fg={fg}>{label}</Chip></span>
          </div>
        );
      })}
      {rows.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: c.muted }}>No customers match.</div>
      ) : null}
    </Scroller>
  );
}
