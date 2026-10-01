import { BRAND_NAME } from "../config";
import { CRAFTSMEN, MATERIAL_NOTES, px } from "../data";
import { wa, type StoreApi } from "../useStore";
import { GUTTER, SectionHead, Shot } from "../components/ui";

export function About({ store }: { store: StoreApi }) {
  return (
    <>
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(48px,8vw,104px) ${GUTTER} 0`, display: "flex", flexDirection: "column", gap: "clamp(32px,5vw,56px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
          <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--c-accent)" }}>Our workshop</span>
          <h1 style={{ margin: 0, font: "400 clamp(42px,8.5vw,96px)/.98 var(--f-display)", letterSpacing: "-.015em", textWrap: "balance" }}>
            Twenty-two fundis, one workshop in Kariobangi.
          </h1>
        </div>
        <div style={{ position: "relative", aspectRatio: "16/9", minHeight: 280, borderRadius: 4, overflow: "hidden", background: "#8A6446" }}>
          <Shot src={px(27520661, 2000)} alt="The workshop floor — timber racks, workbenches and morning light" tone="#8A6446" loading="eager" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(24px,5vw,72px)" }}>
          <p data-reveal style={{ margin: 0, font: "400 clamp(22px,3vw,30px)/1.35 var(--f-display)", textWrap: "pretty" }}>
            {BRAND_NAME} began in 2014 with two benches and one idea: that Kenyan homes deserve furniture made here,
            from Kenyan wood, by people who sign their work.
          </p>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 16, font: "400 16.5px/1.7 var(--f-body)", color: "var(--c-muted)" }}>
            <p style={{ margin: 0 }}>
              Today our team designs, joins, upholsters and finishes every piece under one roof. Nothing is flat-packed
              and nothing is imported ready-made — when you buy a sofa, you're buying weeks of careful handwork.
            </p>
            <p style={{ margin: 0 }}>
              We train apprentices from the neighbourhood every year, pay above-market wages, and offer a 5-year
              warranty on every frame because we know exactly how it was built.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,128px) ${GUTTER} 0`, display: "flex", flexDirection: "column", gap: 32 }}>
        <SectionHead eyebrow="The craftsmen" title="The hands behind the work" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "clamp(16px,3vw,32px)" }}>
          {CRAFTSMEN.map((c) => (
            <div key={c.name} data-reveal style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/*
                No photograph. The design left this slot empty, and a stock
                portrait would put a real person's face to an invented name
                and a biography they never gave. The caption says what the
                picture would be — see `data.ts`.
              */}
              <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 4, overflow: "hidden", background: c.tone }}>
                <Shot alt={c.shot} tone={c.tone} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "400 24px/1.1 var(--f-display)" }}>{c.name}</span>
                <span style={{ font: "600 12px/1.3 var(--f-body)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-accent)" }}>{c.role}</span>
                <span style={{ font: "400 14.5px/1.55 var(--f-body)", color: "var(--c-muted)", marginTop: 6 }}>{c.bio}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: "clamp(72px,11vw,140px)",
          backgroundColor: "var(--c-wood)",
          backgroundImage:
            "repeating-radial-gradient(ellipse 160% 14% at 20% 50%,rgba(255,236,210,.04) 0 2px,transparent 2px 11px),linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.28))",
          color: "#F7EFE3",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,120px) ${GUTTER}`, display: "flex", flexDirection: "column", gap: 36 }}>
          <div data-reveal style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "#E3B58F" }}>Locally sourced</span>
            <h2 style={{ margin: 0, font: "400 clamp(34px,6vw,60px)/1.02 var(--f-display)", letterSpacing: "-.01em" }}>Materials with a home address</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: "0 40px" }}>
            {MATERIAL_NOTES.map((m) => (
              <div key={m.name} data-reveal style={{ padding: "22px 0", borderTop: "1px solid rgba(247,239,227,.2)", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <span style={{ font: "400 26px/1 var(--f-display)" }}>{m.name}</span>
                  <span style={{ font: "500 12.5px/1 var(--f-body)", color: "#E3B58F" }}>{m.from}</span>
                </div>
                <span style={{ font: "400 14.5px/1.6 var(--f-body)", color: "#EADCC8" }}>{m.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(64px,10vw,120px) ${GUTTER}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <h2 style={{ margin: 0, font: "400 clamp(30px,5vw,52px)/1.05 var(--f-display)", maxWidth: "18ch" }}>Come see the grain for yourself.</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a className="btnInk" href="#" onClick={(e) => { e.preventDefault(); store.go("showroom"); }} style={{ height: 54, padding: "0 26px", borderRadius: 999, background: "var(--c-ink)", color: "var(--c-bg)", display: "inline-flex", alignItems: "center", font: "600 15px/1 var(--f-body)" }}>
            Visit the showroom
          </a>
          <a className="btnOutline" href={wa(`Hi ${BRAND_NAME}, I'd love to book a tour of your workshop.`)} target="_blank" rel="noreferrer" style={{ height: 54, padding: "0 26px", borderRadius: 999, border: "1px solid var(--c-ink)", color: "var(--c-ink)", display: "inline-flex", alignItems: "center", font: "600 15px/1 var(--f-body)" }}>
            Book a workshop tour
          </a>
        </div>
      </section>
    </>
  );
}
