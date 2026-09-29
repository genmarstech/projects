import { useMemo } from "react";
import { DOW, SLOT_TIMES } from "../data";
import { c, font, r } from "../theme";
import type { Store } from "../useStore";

/**
 * Six days across, six two-hour windows down.
 *
 * ── THE BOOKED COUNT IS DERIVED, NOT STORED ────────────────────────────
 *
 * There is no bookings table behind this: `booked` is a function of the
 * day and the window, so the grid shows a plausible, stable shape — busier
 * today than Friday, busiest mid-morning — without inventing records that
 * nothing else in the app knows about. Capacity and blocking ARE real
 * state, because those are the two things this screen exists to change.
 */
const DEMAND = [0.9, 1, 0.95, 0.7, 1, 0.6];

export function Slots({ store }: { store: Store }) {
  const days = useMemo(() => {
    const now = new Date();
    return [...Array(6)].map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      return { dow: i === 0 ? "Today" : DOW[d.getDay()], date: String(d.getDate()) };
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p style={{ margin: 0, color: c.inkSoft, fontSize: 15, maxWidth: 640 }}>
        Set how many orders each two-hour window can take. Click a slot to block
        it for the day; customers see blocked or full slots as unavailable.
      </p>

      <div style={{ background: c.panel, border: `1px solid ${c.lineCard}`, borderRadius: r.card, overflow: "auto", padding: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "110px repeat(6,minmax(130px,1fr))", gap: 10, minWidth: 920 }}>
          <span />
          {days.map((d) => (
            <div key={d.dow + d.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: c.muted }}>
                {d.dow}
              </span>
              <span style={{ fontFamily: font.display, fontSize: 24 }}>{d.date}</span>
            </div>
          ))}

          {SLOT_TIMES.map((time, ti) => (
            <SlotRow key={time} time={time} ti={ti} dayCount={days.length} store={store} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlotRow({
  time, ti, dayCount, store,
}: { time: string; ti: number; dayCount: number; store: Store }) {
  return (
    <>
      <span style={{ fontWeight: 800, fontSize: 14, alignSelf: "center" }}>{time}</span>
      {[...Array(dayCount)].map((_, di) => {
        const key = `${di}-${ti}`;
        // The first and last windows are shorter-staffed, hence a lower default.
        const cap = store.caps[key] ?? (ti === 0 || ti === 5 ? 10 : 16);
        const booked = Math.min(
          cap,
          Math.round(cap * Math.max(0, (1 - di * 0.17) * DEMAND[ti])),
        );
        const blocked = !!store.blocked[key];
        const full = !blocked && booked >= cap;

        return (
          <div
            key={key}
            style={{
              borderRadius: 14,
              border: `1.5px solid ${blocked ? c.off : full ? c.fullBorder : c.line}`,
              background: blocked ? c.doneBg : full ? c.fullBg : c.white,
              padding: 10, display: "flex", flexDirection: "column", gap: 8,
              transition: "background .25s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: blocked ? c.muted : full ? c.cancelFg : c.ink }}>
                {blocked ? "Blocked" : full ? "Full" : `${booked}/${cap}`}
              </span>
              <button
                type="button"
                onClick={() => store.toggleBlocked(key)}
                style={{ border: 0, background: "none", cursor: "pointer", fontSize: 11, fontWeight: 800, color: blocked ? c.forest : c.faint, padding: 0 }}
              >
                {blocked ? "Unblock" : "Block"}
              </button>
            </div>

            <div style={{ height: 5, borderRadius: 5, background: "rgba(20,32,27,.1)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: (blocked ? 0 : (booked / cap) * 100) + "%",
                  background: full ? c.tomato : c.good,
                  transition: "width .4s",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => store.bumpCap(key, cap, -1)}
                aria-label={`Reduce capacity for ${time}`}
                style={capBtn}
              >
                –
              </button>
              <span style={{ fontSize: 12, color: c.muted, fontWeight: 700 }}>cap {cap}</span>
              <button
                type="button"
                onClick={() => store.bumpCap(key, cap, 1)}
                aria-label={`Increase capacity for ${time}`}
                style={capBtn}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}

const capBtn = {
  width: 26, height: 26, borderRadius: "50%", border: `1px solid ${c.off}`,
  background: c.white, cursor: "pointer", fontSize: 13,
} as const;
