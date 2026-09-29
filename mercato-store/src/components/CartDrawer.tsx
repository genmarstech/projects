import { useEffect, useRef } from "react";
import { c, ease, font, r } from "../theme";
import { BY, money, photo } from "../data";
import { PROMO_CODE } from "../config";
import type { StoreApi } from "../useStore";

/**
 * Things bought alongside what is already in the basket.
 *
 * A fixed list rather than a computed one: there is no order history to mine
 * and no basket-affinity model behind this, so inventing "often bought
 * together" from the catalogue would be a claim the shop cannot support.
 * These are seven staples, filtered to what is not already in the basket.
 */
const SUGGESTIONS = ["egg", "ojc", "chp", "mlk", "ban", "spn", "gou"];

export function CartDrawer({ s }: { s: StoreApi }) {
  const panel = useRef<HTMLElement>(null);

  // Escape closes it. A drawer covering the page with no visible way back is
  // the one interaction people reliably try the keyboard on.
  useEffect(() => {
    if (!s.cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") s.closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [s.cartOpen, s.closeCart]);

  const suggest = SUGGESTIONS.filter((id) => !s.cart[id])
    .slice(0, 3)
    .flatMap((id) => (BY[id] ? [BY[id]] : []));
  const empty = s.lines.length === 0;

  return (
    <>
      <div
        onClick={s.closeCart}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(10,20,16,.5)",
          backdropFilter: "blur(3px)",
          opacity: s.cartOpen ? 1 : 0,
          pointerEvents: s.cartOpen ? "auto" : "none",
          transition: "opacity .45s ease",
        }}
      />
      <aside
        ref={panel}
        aria-label="Basket"
        aria-hidden={!s.cartOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          width: "min(460px,100vw)",
          background: c.cream,
          display: "flex",
          flexDirection: "column",
          transform: s.cartOpen ? "translateX(0)" : "translateX(105%)",
          transition: `transform .6s ${ease.drawer}`,
          boxShadow: "-30px 0 60px -30px rgba(0,0,0,.4)",
        }}
      >
        <div
          style={{
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${c.line}`,
          }}
        >
          <span
            style={{
              fontFamily: font.display,
              fontSize: 34,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Basket <span style={{ color: c.tomato }}>({s.totals.count})</span>
          </span>
          <button
            type="button"
            onClick={s.closeCart}
            aria-label="Close basket"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `1.5px solid ${c.ink}`,
              background: "transparent",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: c.panel,
            borderBottom: `1px solid ${c.line}`,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>{s.totals.freeMsg}</span>
          <div style={{ height: 6, borderRadius: 6, background: c.track, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: s.totals.freePct,
                background: c.good,
                transition: `width .6s ${ease.travel}`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "8px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {empty && (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: font.display, fontSize: 36, textTransform: "uppercase" }}>
                Your basket is empty
              </span>
              <span style={{ color: c.muted }}>Start with something in season.</span>
              <button
                type="button"
                onClick={() => s.goShop("All", true)}
                style={{
                  height: 46,
                  padding: "0 22px",
                  borderRadius: r.pill,
                  border: 0,
                  background: c.forest,
                  color: c.cream,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Browse the aisles
              </button>
            </div>
          )}

          {s.lines.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                gap: 14,
                padding: "16px 0",
                borderBottom: `1px solid ${c.line}`,
              }}
            >
              <img
                src={photo(l.product.img, 200)}
                alt=""
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 14,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{l.product.name}</span>
                  <span style={{ fontWeight: 800 }}>{money(l.product.price * l.qty)}</span>
                </div>
                <span style={{ fontSize: 13, color: c.muted }}>
                  {money(l.product.price)} · {l.product.unit}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: `1.5px solid ${c.ink}`,
                      borderRadius: r.pill,
                      height: 36,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => s.setQty(l.id, l.qty - 1)}
                      aria-label={`One fewer ${l.product.name}`}
                      style={{
                        width: 34,
                        height: 34,
                        border: 0,
                        background: "none",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      –
                    </button>
                    <span
                      style={{
                        minWidth: 18,
                        textAlign: "center",
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => s.setQty(l.id, l.qty + 1)}
                      aria-label={`One more ${l.product.name}`}
                      style={{
                        width: 34,
                        height: 34,
                        border: 0,
                        background: "none",
                        cursor: "pointer",
                        fontSize: 16,
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/*
                    Substitution is per line and defaults to yes, which is
                    what a shopper needs to know before they reach the shelf —
                    not a preference buried in an account page.
                  */}
                  <button
                    type="button"
                    onClick={() => s.toggleSub(l.id)}
                    aria-pressed={l.substitute}
                    style={{
                      background: "none",
                      border: 0,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: l.substitute ? c.good : c.muted,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 16,
                        borderRadius: r.pill,
                        background: l.substitute ? c.good : c.off,
                        position: "relative",
                        transition: "background .25s",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: l.substitute ? 14 : 2,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: c.white,
                          transition: "left .25s",
                        }}
                      />
                    </span>
                    {l.substitute ? "Substitutes OK" : "No substitutes"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {suggest.length > 0 && !empty && (
            <div
              style={{
                padding: "20px 0 8px",
                display: "flex",
                flexDirection: "column",
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
                Often bought together
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {suggest.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => s.add(p.id)}
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
                      src={photo(p.img, 240)}
                      alt=""
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 10,
                        objectFit: "cover",
                      }}
                    />
                    <span
                      style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2, padding: "0 4px" }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "0 4px 4px",
                        color: c.good,
                        fontWeight: 800,
                      }}
                    >
                      + {money(p.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "18px 24px 24px",
            borderTop: `1px solid ${c.line}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: c.panel,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              s.applyPromo();
            }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              value={s.promo}
              onChange={(e) => s.setPromo(e.target.value)}
              placeholder="Promo code"
              aria-label="Promo code"
              style={{
                flex: 1,
                height: 44,
                borderRadius: r.pill,
                border: `1.5px solid ${c.lineInput}`,
                background: c.white,
                padding: "0 16px",
                fontSize: 14,
                textTransform: "uppercase",
                color: c.ink,
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              style={{
                height: 44,
                padding: "0 18px",
                borderRadius: r.pill,
                border: `1.5px solid ${c.ink}`,
                background: "transparent",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </form>

          {s.promoMsg && (
            <span
              role="status"
              style={{ fontSize: 13, fontWeight: 700, color: s.promoOk ? c.good : c.bad }}
            >
              {s.promoMsg}
            </span>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              color: c.inkSoft,
            }}
          >
            <span>{s.totals.feeLabel}</span>
            <span>{s.totals.feeTxt}</span>
          </div>

          {s.totals.hasDiscount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: c.good,
                fontWeight: 700,
              }}
            >
              <span>{PROMO_CODE} applied</span>
              <span>−{s.totals.discTxt}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => s.go("checkout")}
            disabled={empty}
            style={{
              height: 60,
              borderRadius: r.pill,
              border: 0,
              background: c.forest,
              color: c.cream,
              fontWeight: 800,
              fontSize: 16,
              cursor: empty ? "not-allowed" : "pointer",
              opacity: empty ? 0.45 : 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 26px",
            }}
          >
            <span>Checkout</span>
            <span>{s.totals.totalTxt}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
