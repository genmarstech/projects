import { BRAND_NAME, CREDIT_URL } from "../config";
import { CATEGORIES } from "../data";
import { BRAND_GREEN } from "../theme";
import { wa, type StoreApi } from "../useStore";
import type { Page } from "../types";
import { GUTTER } from "./ui";
import { STRIPE } from "./Header";

const COLUMNS: { title: string; links: [string, Page, string?][] }[] = [
  { title: "Shop", links: CATEGORIES.map((c) => ["" + c, "shop" as Page, c] as [string, Page, string]) },
  {
    title: "Company",
    links: [
      ["Our workshop", "about"],
      ["Custom orders", "custom"],
      ["Visit the showroom", "showroom"],
      ["Contact", "contact"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Delivery & assembly", "contact"],
      ["Lipa pole pole", "contact"],
      ["Warranty & care", "contact"],
      ["Trade programme", "contact"],
    ],
  },
];

export function Footer({ store }: { store: StoreApi }) {
  return (
    <footer style={{ background: "var(--c-ink)", color: "#EADFCF" }}>
      <div style={{ height: 6, background: STRIPE }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: `clamp(56px,8vw,96px) ${GUTTER} 28px`, display: "flex", flexDirection: "column", gap: 48 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: "36px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ font: "400 30px/1 var(--f-display)", color: "#F7EFE3" }}>{BRAND_NAME}</span>
            <span style={{ font: "400 14.5px/1.6 var(--f-body)", maxWidth: "32ch" }}>
              Handcrafted furniture from our Nairobi workshop. Showroom on Lantana Road, Westlands.
            </span>
            <a
              className="waBtn"
              href={wa(`Hi ${BRAND_NAME}! I found you online and would like to ask about your furniture.`)}
              target="_blank"
              rel="noreferrer"
              style={{ alignSelf: "flex-start", height: 46, padding: "0 20px", borderRadius: 999, background: BRAND_GREEN.whatsapp, color: BRAND_GREEN.whatsappInk, display: "inline-flex", alignItems: "center", font: "700 14px/1 var(--f-body)" }}
            >
              WhatsApp us
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ font: "600 12px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase", color: "#C9A56A" }}>
                {col.title}
              </span>
              {col.links.map(([label, target, cat]) => (
                <a
                  key={label}
                  className="footerLink"
                  href="#"
                  onClick={(e) => { e.preventDefault(); store.go(target, cat ? { cat } : undefined); }}
                  /* 15px of text is 20px tall; the padding is the thumb target. */
                  style={{ font: "400 15px/1.3 var(--f-body)", color: "#EADFCF", padding: "11px 0" }}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span style={{ font: "500 12.5px/1 var(--f-body)", color: "#BFAF99", marginRight: 6 }}>We accept</span>
          <span style={{ padding: "7px 10px", borderRadius: 4, background: BRAND_GREEN.mpesa, color: "#FFFFFF", font: "800 11px/1 var(--f-body)", letterSpacing: ".04em" }}>M-PESA</span>
          {["VISA", "MASTERCARD", "LIPA POLE POLE"].map((m) => (
            <span key={m} style={{ padding: "7px 10px", borderRadius: 4, border: "1px solid rgba(234,223,207,.3)", font: "700 11px/1 var(--f-body)", letterSpacing: ".04em" }}>
              {m}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, paddingTop: 24, borderTop: "1px solid rgba(234,223,207,.16)", font: "400 13px/1.4 var(--f-body)", color: "#BFAF99" }}>
          <span>© 2026 {BRAND_NAME} · Made in Kenya</span>
          <a className="footerLink" href={CREDIT_URL} target="_blank" rel="noreferrer" style={{ color: "#EADFCF" }}>
            Website by Genmars Tech
          </a>
        </div>

        {/*
          Not in the design, and it has to be here. Everything above — the
          workshop, the fundis, the reviews, the showroom, the prices — is
          invented, and the page is otherwise written to be believed. A
          visitor who takes it for a real shop could try to pay a real
          business, which is the one way this demo could cost somebody money.
        */}
        <p style={{ margin: 0, font: "400 12.5px/1.5 var(--f-body)", color: "#BFAF99", textAlign: "center" }}>
          Demonstration site. {BRAND_NAME} is not a real business — the products, prices, reviews and showroom are
          illustrative, and no payment is processed anywhere on this page.
        </p>
      </div>
    </footer>
  );
}
