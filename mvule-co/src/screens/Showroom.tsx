import { BRAND_NAME } from "../config";
import { ADDRESS, DIRECTIONS, HOURS, px } from "../data";
import { wa } from "../useStore";
import { GUTTER, Shot } from "../components/ui";

const MAP_QUERY = "Westlands, Nairobi";

export function Showroom() {
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(48px,8vw,104px) ${GUTTER} clamp(64px,10vw,120px)`, display: "flex", flexDirection: "column", gap: "clamp(32px,5vw,56px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
        <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--c-accent)" }}>Visit the showroom</span>
        <h1 style={{ margin: 0, font: "400 clamp(42px,8.5vw,96px)/.98 var(--f-display)", letterSpacing: "-.015em" }}>Sit on it before you buy it.</h1>
        <p style={{ margin: 0, font: "400 17px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: "50ch" }}>
          Over 80 pieces on display, fabric and wood samples to take home, and a designer on hand to help you plan your
          space. Coffee's on us.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "clamp(20px,4vw,48px)", alignItems: "stretch" }}>
        <div style={{ position: "relative", minHeight: 360, borderRadius: 4, overflow: "hidden", background: "var(--c-surface)" }}>
          {/*
            The map points at Westlands generally, not at a street address —
            Mvule House is invented, and dropping a pin on a real building
            would send somebody to a stranger's door.
          */}
          <iframe
            title="Map of Westlands, Nairobi"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&output=embed`}
            loading="lazy"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, filter: "sepia(.25) saturate(.85)" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-muted)" }}>Address</span>
            <span style={{ font: "400 26px/1.25 var(--f-display)" }}>{ADDRESS}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              <a className="btnInk" href={`https://maps.google.com/?q=${encodeURIComponent(MAP_QUERY)}`} target="_blank" rel="noreferrer" style={{ height: 50, padding: "0 22px", borderRadius: 999, background: "var(--c-ink)", color: "var(--c-bg)", display: "inline-flex", alignItems: "center", font: "600 14px/1 var(--f-body)" }}>
                Get directions
              </a>
              <a className="btnOutline" href={wa(`Hi ${BRAND_NAME}, I'd like to book a showroom visit.`)} target="_blank" rel="noreferrer" style={{ height: 50, padding: "0 22px", borderRadius: 999, border: "1px solid var(--c-ink)", color: "var(--c-ink)", display: "inline-flex", alignItems: "center", font: "600 14px/1 var(--f-body)" }}>
                Book a private visit
              </a>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 10 }}>Opening hours</span>
            {HOURS.map((h) => (
              <div key={h.d} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: "1px solid var(--c-line)", font: "500 15px/1.3 var(--f-body)" }}>
                <span>{h.d}</span>
                <span style={{ color: "var(--c-muted)" }}>{h.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 16 }}>
        {DIRECTIONS.map((d) => (
          <div key={d.t} data-reveal style={{ padding: 24, borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ font: "400 22px/1.15 var(--f-display)" }}>{d.t}</span>
            <span style={{ font: "400 14.5px/1.6 var(--f-body)", color: "var(--c-muted)" }}>{d.b}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", aspectRatio: "21/9", minHeight: 240, borderRadius: 4, overflow: "hidden", background: "#B79B7C" }}>
        <Shot src={px(19689230, 2000)} alt="A furniture showroom interior, styled vignettes under warm lighting" tone="#B79B7C" />
      </div>
    </section>
  );
}
