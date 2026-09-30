import { COMPOUNDS } from "../data";
import { c, ease, font, stretch } from "../theme";
import type { StoreApi } from "../useStore";

/**
 * 03 — the wheel, and the trade-off behind picking one.
 *
 * The stats are deliberately two different kinds of number. Grip and
 * durability are percentages and their bars mean something. Working window
 * and lap delta are not — a temperature range has no percentage — so their
 * bars are an index, and the value beside them is the real answer. The bar
 * is there to make the row scannable, not to be read off.
 */
export function TyreLab({ store }: { store: StoreApi }) {
  const comp = store.compoundData;

  const stats = [
    { label: "Grip", value: String(comp.grip), pct: `${comp.grip}%` },
    { label: "Durability", value: String(comp.life), pct: `${comp.life}%` },
    { label: "Working window", value: comp.temp, pct: `${30 + store.compound * 12}%` },
    { label: "Lap delta", value: comp.pace, pct: `${100 - store.compound * 16}%` },
  ];

  return (
    <section
      id="tyre"
      data-sec="3"
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "clamp(100px,14vh,160px) clamp(20px,3vw,40px) 80px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
        gap: 40,
        alignItems: "center",
        background: "radial-gradient(ellipse 60% 70% at 72% 50%,#1a0605 0%,#0a0a0a 70%)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 560 }}>
        <div data-reveal style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: ".16em", color: c.red, textTransform: "uppercase" }}>
          03 — Tyre lab
        </div>
        <h2
          data-reveal
          style={{
            margin: 0,
            fontStretch: stretch.wide,
            fontWeight: 900,
            fontSize: "clamp(36px,5vw,84px)",
            lineHeight: 0.88,
            letterSpacing: "-.035em",
            textTransform: "uppercase",
          }}
        >
          Grip is
          <br />
          a choice.
        </h2>
        <p data-reveal style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: c.dimmer, maxWidth: 440, textWrap: "pretty" }}>
          Drag the wheel to inspect it. Pick a compound to see how the trade-off between grip and life shifts.
        </p>

        <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Tyre compound">
          {COMPOUNDS.map((cp, i) => {
            const on = i === store.compound;
            return (
              <button
                key={cp.name}
                data-hover
                aria-pressed={on}
                onClick={() => store.setCompound(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  minHeight: 44,
                  background: on ? c.ink : "transparent",
                  color: on ? c.black : c.ink,
                  border: `1px solid ${on ? c.ink : c.lineHard}`,
                  fontFamily: font.mono,
                  fontSize: 12,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background .25s, color .25s, border-color .25s",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: cp.color }} />
                {cp.name}
              </button>
            );
          })}
        </div>

        <div data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: c.lineSoft, border: `1px solid ${c.lineSoft}` }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: c.panel, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  fontFamily: font.mono,
                  fontSize: 10,
                  letterSpacing: ".14em",
                  color: c.faint,
                  textTransform: "uppercase",
                }}
              >
                <span>{s.label}</span>
                <span style={{ color: c.ink }}>{s.value}</span>
              </div>
              <div style={{ height: 3, background: c.lineSoft }}>
                <div style={{ height: "100%", width: s.pct, background: comp.color, transition: `width .7s ${ease.out}, background .4s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", height: "min(78vh,720px)", minHeight: 420 }}>
        {/*
          `touch-action: pan-y` lets a thumb drag the wheel sideways while the
          page still scrolls vertically. Without it the whole gesture is
          claimed and the section becomes a scroll trap on a phone.
        */}
        <div data-tyre-host data-hover style={{ position: "absolute", inset: 0, cursor: "grab", touchAction: "pan-y" }} />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            fontFamily: font.mono,
            fontSize: 11,
            letterSpacing: ".14em",
            color: c.faint,
            textTransform: "uppercase",
            textAlign: "right",
            pointerEvents: "none",
          }}
        >
          18″ · 305/720
          <br />
          <span style={{ color: c.ink }}>{comp.name} compound</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            fontFamily: font.mono,
            fontSize: 10,
            letterSpacing: ".16em",
            color: c.fainter,
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          ← Drag to rotate →
        </div>
      </div>
    </section>
  );
}
