import { useEffect, useRef, type ReactNode } from "react";
import { BRAND_NAME } from "../config";
import { PAYBILL, kes, px } from "../data";
import { BRAND_GREEN, SWATCHES } from "../theme";
import { deposit, waProduct, type StoreApi } from "../useStore";
import { Shot } from "./ui";

/**
 * The two overlays: quick view, and the M-Pesa sheet.
 *
 * Both share a shell that closes on the backdrop and on Escape, moves focus
 * inside on open, and locks the page behind. The design did none of that —
 * it closed on a backdrop click only — and on a phone the result is a sheet
 * you can scroll the shop behind, with the keyboard still out in the page.
 *
 * Centred on a desktop, bottom-sheet on a phone, which is the design's own
 * `modalAlign` / `modalRadius` pair.
 */
function Overlay({
  onClose,
  desktop,
  label,
  maxWidth,
  children,
}: {
  onClose: () => void;
  desktop: boolean;
  label: string;
  maxWidth: number;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 95,
        background: "rgba(20,14,10,.5)",
        display: "flex",
        alignItems: desktop ? "center" : "flex-end",
        justifyContent: "center",
        padding: desktop ? 24 : 0,
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "92svh",
          overflowY: "auto",
          background: "var(--c-bg)",
          borderRadius: desktop ? 6 : "18px 18px 0 0",
          outline: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const closeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);

export function QuickView({ store }: { store: StoreApi }) {
  const p = store.quick;
  if (!p) return null;
  return (
    <Overlay onClose={store.closeQuick} desktop={store.desktop} label={p.name} maxWidth={860}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))" }}>
        <div style={{ position: "relative", aspectRatio: "4/5", maxHeight: "52svh", background: p.tone, overflow: "hidden" }}>
          <Shot src={px(p.img, 1000)} alt={p.name} tone={p.tone} loading="eager" />
        </div>
        <div style={{ padding: "clamp(22px,4vw,36px)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <span style={{ font: "600 11px/1 var(--f-body)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-accent)" }}>
              {p.cat}
            </span>
            <button
              type="button"
              onClick={store.closeQuick}
              aria-label="Close"
              style={{ width: 44, height: 44, margin: "-10px -10px 0 0", border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--c-ink)" }}
            >
              {closeIcon}
            </button>
          </div>
          <span style={{ font: "400 clamp(28px,4vw,38px)/1.05 var(--f-display)" }}>{p.name}</span>
          <span style={{ font: "600 20px/1 var(--f-body)" }}>{kes(p.price)}</span>
          <p style={{ margin: 0, font: "400 15px/1.6 var(--f-body)", color: "var(--c-muted)" }}>{p.desc}</p>
          <span style={{ font: "400 13.5px/1.5 var(--f-body)", color: "var(--c-muted)" }}>
            Solid {p.material.toLowerCase()} · {p.fabric} · {p.dims}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {p.colours.map((c) => (
              <span key={c} title={c} style={{ width: 26, height: 26, borderRadius: "50%", background: SWATCHES[c], boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto", paddingTop: 8 }}>
            <button
              type="button"
              className="btnInk"
              onClick={() => store.go("product", { pid: p.id })}
              style={{ height: 52, borderRadius: 999, border: 0, background: "var(--c-ink)", color: "var(--c-bg)", font: "600 15px/1 var(--f-body)", cursor: "pointer" }}
            >
              View full details
            </button>
            <a
              className="btnOutline"
              href={waProduct(p, p.colours[0]!)}
              target="_blank"
              rel="noreferrer"
              style={{ height: 52, borderRadius: 999, border: "1px solid var(--c-ink)", color: "var(--c-ink)", display: "flex", alignItems: "center", justifyContent: "center", font: "600 15px/1 var(--f-body)" }}
            >
              Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export function MpesaModal({ store }: { store: StoreApi }) {
  const p = store.product;
  const colour = store.swatch ?? p.colours[0]!;
  const full = store.plan === "full";
  const amount = full ? kes(p.price) : deposit(p);

  const steps: [string, string][] = [
    ["1. M-Pesa menu", "Lipa na M-Pesa"],
    ["2. Select", "Pay Bill"],
    ["3. Business no.", PAYBILL],
    ["4. Account no.", `MVL-${p.id.slice(0, 4).toUpperCase()}`],
    ["5. Amount", amount],
  ];

  return (
    <Overlay onClose={store.closeMpesa} desktop={store.desktop} label="Pay with M-Pesa" maxWidth={480}>
      <div style={{ padding: "24px 22px calc(24px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ padding: "6px 9px", borderRadius: 4, background: BRAND_GREEN.mpesa, color: "#FFFFFF", font: "800 12px/1 var(--f-body)", letterSpacing: ".04em" }}>M-PESA</span>
            <span style={{ font: "400 22px/1 var(--f-display)" }}>Lipa na M-Pesa</span>
          </div>
          <button
            type="button"
            onClick={store.closeMpesa}
            aria-label="Close"
            style={{ width: 44, height: 44, marginRight: -10, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--c-ink)" }}
          >
            {closeIcon}
          </button>
        </div>

        {/*
          Not in the design, and the single most important line in this file.
          Everything below looks exactly like a real payment sheet, down to
          the STK copy telling somebody to enter their PIN. Nothing here
          charges anyone, the paybill is not a real one, and a visitor is
          entitled to know that before they start typing a phone number.
        */}
        <p
          style={{
            margin: 0,
            padding: "10px 12px",
            borderRadius: 4,
            border: "1px dashed var(--c-line)",
            font: "500 12.5px/1.5 var(--f-body)",
            color: "var(--c-muted)",
          }}
        >
          Demonstration only — no prompt is sent, no paybill is real and no money moves.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 16, borderRadius: 4, background: "var(--c-surface)" }}>
          <span style={{ font: "500 13px/1.3 var(--f-body)", color: "var(--c-muted)" }}>{p.name} · {colour}</span>
          <span style={{ font: "600 24px/1.1 var(--f-body)" }}>{amount}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([["full", "Pay in full", kes(p.price)], ["deposit", "Lipa pole pole", `${deposit(p)} deposit (40%)`]] as const).map(([k, label, sub]) => (
            <button
              key={k}
              type="button"
              aria-pressed={store.plan === k}
              onClick={() => store.setPlan(k)}
              style={{ padding: 14, borderRadius: 4, border: `1.5px solid ${store.plan === k ? BRAND_GREEN.mpesa : "var(--c-line)"}`, background: "var(--c-bg)", color: "var(--c-ink)", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4 }}
            >
              <span style={{ font: "600 14px/1.2 var(--f-body)" }}>{label}</span>
              <span style={{ font: "400 12.5px/1.3 var(--f-body)", color: "var(--c-muted)" }}>{sub}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--c-surface)" }}>
          {([["stk", "Prompt to my phone"], ["paybill", "Paybill details"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={store.payTab === k}
              onClick={() => store.setPayTab(k)}
              style={{ flex: 1, height: 40, borderRadius: 999, border: 0, background: store.payTab === k ? "var(--c-bg)" : "transparent", color: "var(--c-ink)", font: "600 13px/1 var(--f-body)", cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
        </div>

        {store.payTab === "stk" ? (
          store.stkSent ? (
            <div style={{ padding: 20, borderRadius: 4, border: `1px solid ${BRAND_GREEN.mpesa}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "400 22px/1.2 var(--f-display)" }}>This is where the prompt would arrive</span>
              <span style={{ font: "400 14px/1.55 var(--f-body)", color: "var(--c-muted)" }}>
                On the real shop, {store.phone} would get an M-Pesa request for {amount} to {BRAND_NAME}, then an SMS
                and a WhatsApp confirmation. Nothing has been sent.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, font: "600 12px/1 var(--f-body)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-muted)" }}>
                M-Pesa phone number
                <input
                  type="tel"
                  value={store.phone}
                  onChange={(e) => store.setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  style={{ height: 54, padding: "0 14px", border: "1px solid var(--c-line)", borderRadius: 4, background: "var(--c-bg)", color: "var(--c-ink)", font: "600 17px/1 var(--f-body)", letterSpacing: ".04em" }}
                />
              </label>
              <button
                type="button"
                onClick={store.sendStk}
                style={{ height: 56, borderRadius: 999, border: 0, background: BRAND_GREEN.mpesa, color: "#FFFFFF", font: "700 16px/1 var(--f-body)", cursor: "pointer" }}
              >
                Send payment request
              </button>
            </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {steps.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "13px 0", borderTop: "1px solid var(--c-line)", font: "400 14.5px/1.3 var(--f-body)" }}>
                <span style={{ color: "var(--c-muted)" }}>{k}</span>
                <span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Overlay>
  );
}
