import { BRAND_NAME, WHATSAPP_NUMBER } from "../config";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, SOCIALS } from "../data";
import { BRAND_GREEN } from "../theme";
import { wa, type StoreApi } from "../useStore";
import { GUTTER } from "../components/ui";

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

export function Contact({ store }: { store: StoreApi }) {
  const cards = [
    { label: "WhatsApp", value: CONTACT_PHONE_DISPLAY, note: "Fastest — replies in ~15 min", href: wa(`Hi ${BRAND_NAME}!`), bg: BRAND_GREEN.whatsapp, fg: BRAND_GREEN.whatsappInk },
    { label: "Call", value: CONTACT_PHONE_DISPLAY, note: "Mon–Sat, 9am – 6pm", href: `tel:+${WHATSAPP_NUMBER}`, bg: "var(--c-ink)", fg: "var(--c-bg)" },
    { label: "Email", value: CONTACT_EMAIL, note: "Trade & bulk orders", href: `mailto:${CONTACT_EMAIL}`, bg: "var(--c-surface)", fg: "var(--c-ink)" },
    { label: "Showroom", value: "Lantana Rd, Westlands", note: "Open 7 days", href: "https://maps.google.com/?q=Westlands,Nairobi", bg: "var(--c-accent)", fg: "var(--c-bg)" },
  ];

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(48px,8vw,104px) ${GUTTER} clamp(64px,10vw,120px)`, display: "flex", flexDirection: "column", gap: "clamp(32px,5vw,56px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
        <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--c-accent)" }}>Contact</span>
        <h1 style={{ margin: 0, font: "400 clamp(42px,8.5vw,96px)/.98 var(--f-display)", letterSpacing: "-.015em" }}>Karibu. How can we help?</h1>
        <p style={{ margin: 0, font: "400 17px/1.6 var(--f-body)", color: "var(--c-muted)", maxWidth: "50ch" }}>
          WhatsApp is the fastest way to reach us — we usually reply within 15 minutes during showroom hours.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 12 }}>
        {cards.map((c) => (
          <a
            key={c.label}
            className="liftCard"
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            style={{ padding: 24, borderRadius: 4, background: c.bg, color: c.fg, display: "flex", flexDirection: "column", gap: 28, justifyContent: "space-between", minHeight: 170 }}
          >
            <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase" }}>{c.label}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ font: "400 24px/1.15 var(--f-display)", wordBreak: "break-word" }}>{c.value}</span>
              <span style={{ font: "400 13.5px/1.4 var(--f-body)", opacity: .85 }}>{c.note}</span>
            </div>
          </a>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: "clamp(24px,5vw,72px)", paddingTop: "clamp(16px,3vw,32px)", borderTop: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <h2 style={{ margin: 0, font: "400 clamp(28px,4vw,40px)/1.1 var(--f-display)" }}>Follow along</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: "1px solid var(--c-line)", font: "500 16px/1 var(--f-body)", color: "var(--c-ink)" }}>
                <span>{s.name}</span>
                <span style={{ color: "var(--c-muted)" }}>{s.handle} ↗</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          {store.contactSent ? (
            <div style={{ padding: 28, borderRadius: 4, background: "var(--c-surface)", display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ font: "400 26px/1.2 var(--f-display)" }}>Message sent — asante!</span>
              <span style={{ font: "400 15px/1.55 var(--f-body)", color: "var(--c-muted)" }}>
                We'll reply by email or WhatsApp within one working day.
              </span>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); store.submitContact(); }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h2 style={{ margin: "0 0 8px", font: "400 clamp(28px,4vw,40px)/1.1 var(--f-display)" }}>Send a message</h2>
              <input name="name" required placeholder="Name" aria-label="Name" style={field} />
              <input name="contact" type="text" required placeholder="Phone or email" aria-label="Phone or email" style={field} />
              <select name="topic" aria-label="Topic" style={field}>
                {["General enquiry", "Order status", "Interior designer / trade", "Airbnb or office fit-out", "After-sales & warranty"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <textarea
                name="msg"
                rows={4}
                aria-label="Your message"
                placeholder="Your message"
                style={{ ...field, height: "auto", padding: 14, font: "400 16px/1.5 var(--f-body)", resize: "vertical" }}
              />
              <button type="submit" className="btnInk" style={{ height: 54, borderRadius: 999, border: 0, background: "var(--c-ink)", color: "var(--c-bg)", font: "600 15px/1 var(--f-body)", cursor: "pointer" }}>
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
