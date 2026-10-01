import { BRAND_NAME, FREE_DELIVERY_FROM, SHOW_ANNOUNCEMENT, WHATSAPP_NUMBER } from "../config";
import { CONTACT_PHONE_DISPLAY, kes } from "../data";
import { BRAND_GREEN } from "../theme";
import { wa, type StoreApi } from "../useStore";
import type { Page } from "../types";
import { GUTTER } from "./ui";

const NAV: [string, Page][] = [
  ["Shop", "shop"],
  ["Custom orders", "custom"],
  ["Our workshop", "about"],
  ["Showroom", "showroom"],
  ["Contact", "contact"],
];

/** The woven stripe under the announcement and above the footer. */
export const STRIPE =
  "repeating-linear-gradient(90deg,var(--c-accent) 0 18px,var(--c-bg) 18px 21px,var(--c-olive) 21px 33px,var(--c-bg) 33px 36px,#C9A56A 36px 44px,var(--c-bg) 44px 47px)";

export function Header({ store }: { store: StoreApi }) {
  const { desktop } = store;

  return (
    <>
      {SHOW_ANNOUNCEMENT && (
        <div style={{ background: "var(--c-ink)", color: "var(--c-bg)" }}>
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              padding: "10px 20px",
              display: "flex",
              justifyContent: "center",
              font: "500 12px/1.4 var(--f-body)",
              letterSpacing: ".04em",
              textAlign: "center",
            }}
          >
            Free delivery within Nairobi on orders over {kes(FREE_DELIVERY_FROM)} · Lipa pole pole available
          </div>
          <div style={{ height: 4, background: STRIPE }} />
        </div>
      )}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "color-mix(in srgb, var(--c-bg) 92%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--c-line)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: `0 clamp(16px,4vw,48px)`,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {!desktop && (
            <button
              type="button"
              onClick={store.toggleMenu}
              aria-label="Menu"
              aria-expanded={store.menuOpen}
              style={{ width: 44, height: 44, marginLeft: -10, display: "grid", placeItems: "center", border: 0, background: "transparent", color: "var(--c-ink)", cursor: "pointer" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M3 7h18M3 12h18M3 17h12" />
              </svg>
            </button>
          )}

          <a
            href="#"
            onClick={(e) => { e.preventDefault(); store.go("home"); }}
            style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--c-ink)", padding: "5px 0" }}
          >
            <span
              aria-hidden
              style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--c-accent)", color: "var(--c-bg)", display: "grid", placeItems: "center", font: "400 18px/1 var(--f-display)" }}
            >
              {BRAND_NAME.trim().charAt(0).toUpperCase()}
            </span>
            <span style={{ font: "400 21px/1 var(--f-display)", letterSpacing: ".01em", whiteSpace: "nowrap" }}>
              {BRAND_NAME}
            </span>
          </a>

          {desktop && (
            <>
              <nav style={{ display: "flex", alignItems: "center", gap: 30 }}>
                {NAV.map(([label, target]) => {
                  // The shop tab stays lit while a product is open — a product
                  // is somewhere inside the shop, not a seventh destination.
                  const active = store.page === target || (target === "shop" && store.page === "product");
                  return (
                    <a
                      key={target}
                      href="#"
                      onClick={(e) => { e.preventDefault(); store.go(target, target === "shop" ? { cat: "All" } : undefined); }}
                      style={{
                        font: "500 14px/1 var(--f-body)",
                        color: active ? "var(--c-accent)" : "var(--c-ink)",
                        letterSpacing: ".02em",
                        padding: "8px 0",
                        borderBottom: `1px solid ${store.page === target ? "var(--c-accent)" : "transparent"}`,
                      }}
                    >
                      {label}
                    </a>
                  );
                })}
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a
                  className="btnOutline"
                  href={wa(`Hi ${BRAND_NAME}! I found you online and would like to ask about your furniture.`)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ height: 42, padding: "0 18px", borderRadius: 999, border: "1px solid var(--c-ink)", display: "inline-flex", alignItems: "center", font: "600 13px/1 var(--f-body)", color: "var(--c-ink)" }}
                >
                  WhatsApp us
                </a>
                <a
                  className="btnInk"
                  href="#"
                  onClick={(e) => { e.preventDefault(); store.go("showroom"); }}
                  style={{ height: 42, padding: "0 18px", borderRadius: 999, background: "var(--c-ink)", display: "inline-flex", alignItems: "center", font: "600 13px/1 var(--f-body)", color: "var(--c-bg)" }}
                >
                  Visit showroom
                </a>
              </div>
            </>
          )}

          {!desktop && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); store.go("shop", { cat: "All" }); }}
              aria-label="Shop"
              style={{ width: 44, height: 44, marginRight: -10, display: "grid", placeItems: "center", color: "var(--c-ink)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </a>
          )}
        </div>
      </header>

      {store.menuOpen && !desktop && <MobileMenu store={store} />}
    </>
  );
}

function MobileMenu({ store }: { store: StoreApi }) {
  return (
    <div
      role="dialog"
      aria-label="Menu"
      style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--c-bg)", display: "flex", flexDirection: "column", overflowY: "auto" }}
    >
      <div style={{ height: 64, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--c-line)" }}>
        <span style={{ font: "400 21px/1 var(--f-display)" }}>{BRAND_NAME}</span>
        <button
          type="button"
          onClick={store.closeMenu}
          aria-label="Close"
          style={{ width: 44, height: 44, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--c-ink)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
      </div>

      <nav style={{ padding: `28px ${GUTTER}`, display: "flex", flexDirection: "column" }}>
        {([["Home", "home"], ...NAV] as [string, Page][]).map(([label, target]) => (
          <a
            key={target}
            href="#"
            onClick={(e) => { e.preventDefault(); store.go(target, target === "shop" ? { cat: "All" } : undefined); }}
            style={{ font: "400 36px/1 var(--f-display)", padding: "14px 0", borderBottom: "1px solid var(--c-line)", color: "var(--c-ink)" }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "24px 20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        <a
          href={wa(`Hi ${BRAND_NAME}! I found you online and would like to ask about your furniture.`)}
          target="_blank"
          rel="noreferrer"
          style={{ height: 54, borderRadius: 999, background: BRAND_GREEN.whatsapp, color: BRAND_GREEN.whatsappInk, display: "flex", alignItems: "center", justifyContent: "center", font: "700 15px/1 var(--f-body)" }}
        >
          Chat on WhatsApp
        </a>
        <a
          href={`tel:+${WHATSAPP_NUMBER}`}
          style={{ height: 54, borderRadius: 999, border: "1px solid var(--c-ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "600 15px/1 var(--f-body)", color: "var(--c-ink)" }}
        >
          Call {CONTACT_PHONE_DISPLAY}
        </a>
        <p style={{ margin: "8px 0 0", font: "400 13px/1.5 var(--f-body)", color: "var(--c-muted)", textAlign: "center" }}>
          Showroom open today · Lantana Rd, Westlands
        </p>
      </div>
    </div>
  );
}
