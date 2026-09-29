import { useState } from "react";
import { Meter, Switch } from "../components/ui";
import { c, font, r } from "../theme";
import type { Store } from "../useStore";

export function Promotions({ store }: { store: Store }) {
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(15);
  const [cap, setCap] = useState("200");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 16, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, gridColumn: "span 2", minWidth: 0 }}>
        {store.promos.map((p, i) => (
          <div
            key={p.code}
            style={{
              background: c.panel, border: `1px solid ${c.lineCard}`, borderRadius: r.panel,
              padding: "18px 22px", display: "flex", alignItems: "center", gap: 18,
              flexWrap: "wrap",
              // A paused code stays listed but dims — it is still a code
              // somebody might have, not a deleted one.
              opacity: p.on ? 1 : 0.55, transition: "opacity .3s",
            }}
          >
            <span style={{ fontFamily: font.display, fontSize: 28, letterSpacing: ".02em", minWidth: 140 }}>
              {p.code}
            </span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 160 }}>
              <span style={{ fontWeight: 800 }}>{p.desc}</span>
              <span style={{ fontSize: 13, color: c.muted }}>{p.uses} redemptions</span>
            </div>
            <div style={{ width: 140, display: "flex", flexDirection: "column", gap: 4 }}>
              <Meter pct={Math.min(100, (p.uses / p.cap) * 100) + "%"} color={c.tomato} height={6} />
              <span style={{ fontSize: 12, color: c.muted, fontWeight: 700 }}>
                {p.uses >= p.cap ? "Limit reached" : `${p.cap - p.uses} left of ${p.cap}`}
              </span>
            </div>
            <Switch on={p.on} onClick={() => store.togglePromo(i)} label={`Enable ${p.code}`} />
          </div>
        ))}
      </div>

      <div style={{ background: c.forest, color: c.cream, borderRadius: r.card, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 400, fontSize: 32, textTransform: "uppercase" }}>
          New promotion
        </h2>

        <label style={fieldLabel}>
          Code
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER15"
            style={{ ...fieldInput, textTransform: "uppercase", letterSpacing: ".04em" }}
          />
        </label>

        <label style={fieldLabel}>
          Discount · {pct}%
          <input
            type="range" min={5} max={40} step={5} value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            style={{ accentColor: c.amber }}
          />
        </label>

        <label style={fieldLabel}>
          Usage limit
          <input
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            inputMode="numeric"
            style={fieldInput}
          />
        </label>

        <button
          type="button"
          onClick={() => {
            if (store.createPromo(code, pct, parseInt(cap, 10))) setCode("");
          }}
          style={{
            height: 52, borderRadius: r.pill, border: 0, background: c.amber,
            color: c.ink, fontWeight: 800, fontSize: 15, cursor: "pointer",
          }}
        >
          Create code
        </button>
      </div>
    </div>
  );
}

const fieldLabel = {
  display: "flex", flexDirection: "column", gap: 6, fontSize: 12,
  fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
  color: c.onForestSoft,
} as const;

const fieldInput = {
  height: 46, borderRadius: 12, border: 0, padding: "0 14px",
  fontSize: 16, fontWeight: 800, color: c.ink,
} as const;
