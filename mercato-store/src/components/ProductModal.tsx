import { useEffect } from "react";
import { c, ease, font, r } from "../theme";
import { BY, PRODUCTS, money, photo } from "../data";
import type { ProductTab, SubPref } from "../types";
import type { StoreApi } from "../useStore";
import { Badge, saveBadge } from "./ui";

/**
 * The product sheet.
 *
 * ── IT STAYS MOUNTED ────────────────────────────────────────────────────────
 *
 * `pid` is what is open; `lastPid` is what to draw. They differ for the half
 * second the sheet takes to leave, which is the whole reason for the second
 * field — unmounting on close empties the panel and then animates a blank
 * card off the screen.
 *
 * ── THE STORAGE COPY IS PER DEPARTMENT, NOT PER PRODUCT ─────────────────────
 *
 * Writing storage advice for twenty-three items invites twenty-three chances
 * to say something wrong about food. Produce, bakery and everything chilled
 * is the distinction that actually changes the advice.
 */

const TABS: ProductTab[] = ["About", "Nutrition", "Storage"];

const SUB_PREFS: { value: SubPref; label: string }[] = [
  { value: "best", label: "Shopper picks best match" },
  { value: "call", label: "Message me first" },
  { value: "none", label: "Don't substitute" },
];

export function ProductModal({ s }: { s: StoreApi }) {
  const p = BY[s.lastPid];
  const open = !!s.pid;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") s.closeProduct();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, s.closeProduct]);

  if (!p) return null;

  const inBasket = s.qty(p.id) > 0;
  const badge = saveBadge(p);

  const tabText: Record<ProductTab, string> = {
    About: p.desc,
    Nutrition:
      "Per serving: see pack for full nutritional information. Allergens are highlighted in bold on the label; our shoppers check every item for damage and date before packing.",
    Storage:
      p.cat === "Produce"
        ? "Store at room temperature until ripe, then refrigerate to hold for 3–5 more days."
        : p.cat === "Bakery"
          ? "Keep in a paper bag at room temperature. Slice and freeze to keep for up to a month."
          : "Keep refrigerated below 41°F. Use within the date on pack.",
  };

  /*
   * Three pairings from other departments, chosen by the product's own id so
   * the same item always suggests the same three. A random draw would change
   * the sheet every time it opened, which reads as a bug rather than variety.
   */
  const start = p.id.charCodeAt(0) % 6;
  const pairs = PRODUCTS.filter((x) => x.id !== p.id && x.cat !== p.cat).slice(start, start + 3);

  return (
    <div
      onClick={s.closeProduct}
      role="dialog"
      aria-modal={open}
      aria-label={p.name}
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 95,
        background: "rgba(10,20,16,.6)",
        backdropFilter: "blur(4px)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity .4s ease",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(1040px,100%)",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
          background: c.cream,
          borderRadius: r.modal,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))",
          transform: open ? "none" : "translateY(40px) scale(.97)",
          transition: `transform .55s ${ease.drawer}`,
        }}
      >
        <div style={{ position: "relative", minHeight: 380, background: c.lineCard }}>
          <img
            src={photo(p.img, 1200)}
            alt={p.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {badge && (
            <Badge style={{ position: "absolute", top: 18, left: 18, fontSize: 12, padding: "6px 10px" }}>
              {badge}
            </Badge>
          )}
        </div>

        <div
          style={{
            padding: "clamp(24px,3vw,40px)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: c.muted,
              }}
            >
              {p.cat} · {p.origin}
            </span>
            <button
              type="button"
              onClick={s.closeProduct}
              aria-label="Close"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1.5px solid ${c.ink}`,
                background: "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: font.display,
              fontWeight: 400,
              textTransform: "uppercase",
              fontSize: "clamp(40px,4.5vw,60px)",
              lineHeight: 0.92,
              textWrap: "balance",
            }}
          >
            {p.name}
          </h2>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{money(p.price)}</span>
            {p.was && (
              <span style={{ color: c.faint, textDecoration: "line-through" }}>
                {money(p.was)}
              </span>
            )}
            <span style={{ fontSize: 14, color: c.muted }}>{p.unit}</span>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.diet.map((d) => (
              <span
                key={d}
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "6px 10px",
                  borderRadius: r.pill,
                  background: c.dietBg,
                  color: c.dietFg,
                }}
              >
                {d}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${c.line}` }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => s.setPtab(t)}
                aria-pressed={s.ptab === t}
                style={{
                  background: "none",
                  border: 0,
                  borderBottom: `2.5px solid ${s.ptab === t ? c.tomato : "transparent"}`,
                  padding: "10px 12px",
                  marginBottom: -1,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  color: c.ink,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Fixed minimum so switching tabs does not reflow the buttons beneath. */}
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: c.inkSoft,
              minHeight: 72,
              textWrap: "pretty",
            }}
          >
            {tabText[s.ptab]}
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${c.ink}`,
                borderRadius: r.pill,
                height: 54,
              }}
            >
              <button
                type="button"
                onClick={() => s.setPqty(Math.max(1, s.pqty - 1))}
                aria-label="One fewer"
                style={{
                  width: 50,
                  height: 50,
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                –
              </button>
              <span
                style={{ minWidth: 24, textAlign: "center", fontWeight: 800, fontSize: 17 }}
              >
                {s.pqty}
              </span>
              <button
                type="button"
                onClick={() => s.setPqty(s.pqty + 1)}
                aria-label="One more"
                style={{
                  width: 50,
                  height: 50,
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                // Sets rather than adds: the stepper above showed the basket
                // quantity when the sheet opened, so adding it again would
                // double what the person is looking at.
                s.setQty(p.id, s.pqty);
                s.closeProduct();
                s.showToast(p.id, `${s.pqty} × ${p.name} in basket`);
              }}
              style={{
                flex: 1,
                minWidth: 200,
                height: 54,
                borderRadius: r.pill,
                border: 0,
                background: c.forest,
                color: c.cream,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {inBasket ? "Update basket" : "Add to basket"} · {money(p.price * s.pqty)}
            </button>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 14,
              fontWeight: 700,
              flexWrap: "wrap",
            }}
          >
            If out of stock
            <select
              value={s.psub[p.id] ?? "best"}
              onChange={(e) =>
                s.setPsub((prev) => ({ ...prev, [p.id]: e.target.value as SubPref }))
              }
              style={{
                height: 40,
                borderRadius: r.pill,
                border: `1.5px solid ${c.lineInput}`,
                background: c.white,
                padding: "0 12px",
                fontWeight: 700,
                color: c.ink,
              }}
            >
              {SUB_PREFS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 6 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: c.muted,
              }}
            >
              Pairs well with
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {pairs.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => s.openProduct(x.id)}
                  style={{
                    background: c.panel,
                    border: `1px solid ${c.lineCard}`,
                    borderRadius: 14,
                    padding: 6,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    textAlign: "left",
                  }}
                >
                  <img
                    src={photo(x.img, 240)}
                    alt=""
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 10,
                      objectFit: "cover",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      padding: "0 4px 4px",
                    }}
                  >
                    {x.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
