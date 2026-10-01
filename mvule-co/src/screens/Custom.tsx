import { BRAND_NAME } from "../config";
import { CUSTOM_BUDGETS, CUSTOM_STEPS, CUSTOM_TYPES } from "../data";
import { BRAND_GREEN } from "../theme";
import { wa, type StoreApi } from "../useStore";
import { Chip, GUTTER } from "../components/ui";

const field: React.CSSProperties = {
  height: 52,
  padding: "0 14px",
  border: "1px solid var(--c-line)",
  borderRadius: 4,
  background: "var(--c-bg)",
  color: "var(--c-ink)",
  font: "500 16px/1 var(--f-body)",
  minWidth: 0,
};
const legend: React.CSSProperties = { font: "400 26px/1.2 var(--f-display)", marginBottom: 14, padding: 0 };
const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  font: "600 12px/1 var(--f-body)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--c-muted)",
};

/**
 * The custom-order brief.
 *
 * The form submits to nothing — there is no backend — so it sets a reference
 * number and swaps itself for a confirmation. The confirmation says a
 * designer will be in touch, which on the real shop would be true; here the
 * footer's demonstration notice is what keeps that honest.
 *
 * The uploader is genuinely local: files become object URLs for the preview
 * and are revoked in `useStore` when they are replaced. Nothing is sent
 * anywhere, which is worth knowing before somebody drops a photograph of
 * their living room into it.
 */
export function Custom({ store }: { store: StoreApi }) {
  const sent = store.customRef !== null;

  return (
    <>
      <section
        style={{
          backgroundColor: "var(--c-surface)",
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(34,29,24,.03) 0 2px,transparent 2px 9px),repeating-linear-gradient(-45deg,rgba(34,29,24,.03) 0 2px,transparent 2px 9px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(48px,8vw,104px) ${GUTTER}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: "clamp(32px,6vw,80px)", alignItems: "end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--c-accent)" }}>Custom orders</span>
            <h1 style={{ margin: 0, font: "400 clamp(42px,8vw,88px)/.98 var(--f-display)", letterSpacing: "-.015em", textWrap: "balance" }}>Made to your measure.</h1>
            <p style={{ margin: 0, font: "400 17px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: "46ch" }}>
              Tell us what you're imagining — a sofa that fits that awkward corner, a 10-seater table for Sunday lunch,
              a desk for your new office. We'll sketch it, quote it and build it.
            </p>
          </div>
          <div className="stepGrid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 1, background: "var(--c-line)", border: "1px solid var(--c-line)" }}>
            {CUSTOM_STEPS.map((s) => (
              <div key={s.n} style={{ background: "var(--c-bg)", padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ font: "400 28px/1 var(--f-display)", color: "var(--c-accent)" }}>{s.n}</span>
                <span style={{ font: "600 14.5px/1.3 var(--f-body)" }}>{s.t}</span>
                <span style={{ font: "400 13px/1.5 var(--f-body)", color: "var(--c-muted)" }}>{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: `clamp(48px,8vw,96px) ${GUTTER} clamp(64px,10vw,120px)` }}>
        {sent ? (
          <div style={{ padding: "clamp(32px,6vw,56px)", borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--c-accent)" }}>
              Request received · {store.customRef}
            </span>
            <h2 style={{ margin: 0, font: "400 clamp(32px,5vw,48px)/1.05 var(--f-display)" }}>Asante! We'll be in touch within 24 hours.</h2>
            <p style={{ margin: 0, font: "400 16px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: "52ch" }}>
              A designer will WhatsApp you with questions, a sketch and a quote. Want to speed things up? Send more
              photos directly.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a
                className="waBtn"
                href={wa(`Hi ${BRAND_NAME}, following up on my custom order request ${store.customRef}.`)}
                target="_blank"
                rel="noreferrer"
                style={{ height: 52, padding: "0 24px", borderRadius: 999, background: BRAND_GREEN.whatsapp, color: BRAND_GREEN.whatsappInk, display: "inline-flex", alignItems: "center", font: "700 15px/1 var(--f-body)" }}
              >
                Continue on WhatsApp
              </a>
              <button type="button" className="btnOutline" onClick={store.resetCustom} style={{ height: 52, padding: "0 24px", borderRadius: 999, border: "1px solid var(--c-ink)", background: "transparent", color: "var(--c-ink)", font: "600 15px/1 var(--f-body)", cursor: "pointer" }}>
                Start another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); store.submitCustom(); }} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <legend style={legend}>1. What would you like made?</legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CUSTOM_TYPES.map((t) => (
                  <Chip key={t} label={t} on={store.customType === t} onClick={() => store.setCustomType(t)} />
                ))}
              </div>
            </fieldset>

            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <legend style={legend}>2. Size &amp; material</legend>
              <div className="dimsGrid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
                {[["Width (cm)", "220"], ["Depth (cm)", "95"], ["Height (cm)", "80"]].map(([l, ph]) => (
                  <label key={l} style={label}>
                    {l}
                    <input name={l} inputMode="numeric" placeholder={ph} style={field} />
                  </label>
                ))}
              </div>
              <label style={label}>
                Preferred wood / material
                <select name="material" style={field}>
                  {["Not sure — advise me", "Mvule", "Mahogany", "Cypress", "Mixed with sisal / rattan"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <legend style={legend}>3. Budget (KES)</legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CUSTOM_BUDGETS.map((b) => (
                  <Chip key={b} label={b} on={store.customBudget === b} onClick={() => store.setCustomBudget(b)} />
                ))}
              </div>
            </fieldset>

            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <legend style={legend}>4. Reference photos</legend>
              <label className="dropzone" style={{ minHeight: 140, border: "1.5px dashed rgba(34,29,24,.3)", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24, textAlign: "center", cursor: "pointer", background: "var(--c-surface)" }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    store.setFiles(
                      Array.from(e.target.files ?? []).slice(0, 4).map((f) => ({ url: URL.createObjectURL(f), name: f.name })),
                    )
                  }
                  style={{ display: "none" }}
                />
                <span style={{ font: "400 20px/1.2 var(--f-display)" }}>Upload a photo or screenshot</span>
                <span style={{ font: "400 13.5px/1.5 var(--f-body)", color: "var(--c-muted)" }}>
                  Pinterest, Instagram, a magazine — or a photo of your space. Up to 4 images, kept on your device.
                </span>
              </label>
              {store.files.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
                  {store.files.map((f) => (
                    <img key={f.url} src={f.url} alt={f.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 4 }} />
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              <legend style={legend}>5. Your details</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 10 }}>
                <input name="name" required placeholder="Full name" aria-label="Full name" style={field} />
                <input name="phone" required type="tel" placeholder="WhatsApp number, e.g. 0712 345 678" aria-label="WhatsApp number" style={field} />
                <input name="area" placeholder="Estate / town, e.g. Ruaka" aria-label="Estate or town" style={field} />
                <select name="when" aria-label="When you need it" style={field}>
                  {["Needed within 1 month", "1–2 months", "Flexible"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <textarea
                name="notes"
                rows={4}
                aria-label="Anything else"
                placeholder="Anything else — fabric, finish, who it's for (home, Airbnb, office)…"
                style={{ ...field, height: "auto", padding: 14, font: "400 16px/1.5 var(--f-body)", resize: "vertical" }}
              />
            </fieldset>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button type="submit" className="btnInk" style={{ height: 58, borderRadius: 999, border: 0, background: "var(--c-ink)", color: "var(--c-bg)", font: "600 16px/1 var(--f-body)", cursor: "pointer" }}>
                Request a free quote
              </button>
              <span style={{ font: "400 13px/1.5 var(--f-body)", color: "var(--c-muted)", textAlign: "center" }}>
                No commitment. Deposit only once you approve the sketch and price.
              </span>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
