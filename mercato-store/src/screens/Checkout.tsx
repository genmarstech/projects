import { c, font, r } from "../theme";
import { STORES, TIMES, isFull, money, photo, roundMoney } from "../data";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, PROMO_CODE } from "../config";
import { Pill } from "../components/ui";
import type { StoreApi } from "../useStore";

/**
 * Three numbered steps and a summary that follows you down the page.
 *
 * The numbering is real: how you want it decides whether step two shows
 * delivery windows or collection times, and whether step three offers a
 * driver tip. They are not three interchangeable panels with badges on them.
 *
 * Placing the order is the one destructive action here — it empties the
 * basket — so it refuses rather than guesses when there is no slot chosen,
 * and says so in the toast instead of disabling a button with no explanation.
 */

const PAYMENTS = [
  { id: "card", label: "Visa •••• 4242", sub: "Expires 08/28" },
  { id: "apple", label: "Apple Pay", sub: "Pay with Face ID" },
  { id: "ebt", label: "EBT / SNAP", sub: "Eligible items only" },
];

const TIPS = [0, 2, 3, 5];

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: c.panel,
        border: `1px solid ${c.lineCard}`,
        borderRadius: r.card,
        padding: "clamp(20px,3vw,32px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: c.forest,
            color: c.cream,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {n}
        </span>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Checkout({ s }: { s: StoreApi }) {
  const delivery = s.mode === "Delivery";
  const dd = s.days[s.day];

  const modeCards = [
    {
      id: "Delivery" as const,
      label: "Delivery",
      sub:
        s.totals.sub >= FREE_DELIVERY_THRESHOLD
          ? "Free on this order"
          : `${money(DELIVERY_FEE)} · free over ${roundMoney(FREE_DELIVERY_THRESHOLD)}`,
    },
    { id: "Pickup" as const, label: "Click & collect", sub: "Always free · ready in 1 hr" },
  ];

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 13,
    fontWeight: 800,
    color: c.muted,
    letterSpacing: ".06em",
    textTransform: "uppercase",
  };

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "40px clamp(16px,3vw,40px) 96px",
      }}
    >
      <h1
        style={{
          margin: "0 0 32px",
          fontFamily: font.display,
          fontWeight: 400,
          textTransform: "uppercase",
          fontSize: "clamp(52px,7vw,96px)",
          lineHeight: 0.9,
        }}
      >
        Checkout
      </h1>

      {/*
        `auto-fit` leaves the collapsed second track's gap behind. Below the
        breakpoint `min(100%,380px)` resolves to the full column width, the
        summary's track collapses to zero, and the 28px gap is still counted —
        so the row measures 28px wider than the grid holding it and the whole
        page scrolls sideways. `styles.css` drops it to one column there; see
        `.checkoutLayout`.
      */}
      <div
        className="checkoutLayout"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            gridColumn: "span 2",
            minWidth: 0,
          }}
        >
          <Step n={1} title="How do you want it?">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                gap: 12,
              }}
            >
              {modeCards.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => s.setMode(m.id)}
                  aria-pressed={s.mode === m.id}
                  style={{
                    textAlign: "left",
                    padding: 18,
                    borderRadius: r.box,
                    border: `2px solid ${s.mode === m.id ? c.forest : c.line}`,
                    background: s.mode === m.id ? c.pickedBg : c.white,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    transition: "border-color .25s,background .25s",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 17 }}>{m.label}</span>
                  <span style={{ fontSize: 14, color: c.muted }}>{m.sub}</span>
                </button>
              ))}
            </div>

            {delivery ? (
              <label style={labelStyle}>
                Delivery address
                <input
                  value={s.address}
                  onChange={(e) => s.setAddress(e.target.value)}
                  style={{
                    height: 50,
                    borderRadius: r.field,
                    border: `1.5px solid ${c.lineInput}`,
                    background: c.white,
                    padding: "0 16px",
                    fontSize: 16,
                    fontWeight: 600,
                    color: c.ink,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                />
              </label>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: 10,
                }}
              >
                {STORES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => s.setStore(st.id)}
                    aria-pressed={s.store === st.id}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: r.img,
                      border: `2px solid ${s.store === st.id ? c.forest : c.line}`,
                      background: c.white,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{st.name}</span>
                    <span style={{ fontSize: 13, color: c.muted }}>{st.addr}</span>
                    <span style={{ fontSize: 13, color: c.good, fontWeight: 700 }}>
                      {st.dist}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Step>

          <Step n={2} title="Pick a time slot">
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {s.days.map((d) => (
                <button
                  key={d.i}
                  type="button"
                  onClick={() => {
                    // A slot belongs to a day. Carrying "4–6pm" across to
                    // Thursday, where it may be fully booked, silently books
                    // something the grid is showing as unavailable.
                    s.setDay(d.i);
                    s.setSlot(null);
                  }}
                  aria-pressed={s.day === d.i}
                  style={{
                    flexShrink: 0,
                    minWidth: 92,
                    padding: "12px 14px",
                    borderRadius: r.img,
                    border: `1.5px solid ${c.ink}`,
                    background: s.day === d.i ? c.ink : "transparent",
                    color: s.day === d.i ? c.cream : c.ink,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    transition: "background .25s,color .25s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {d.dow}
                  </span>
                  <span style={{ fontFamily: font.display, fontSize: 26, lineHeight: 1 }}>
                    {d.date}
                  </span>
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
                gap: 10,
              }}
            >
              {TIMES.map((t, i) => {
                const full = isFull(s.day, i);
                const on = s.slot === t;
                // Every third slot the shop has a van nearby anyway. Worth
                // saying, because it is the one thing that makes a person
                // choose a window other than the soonest.
                const eco = !full && i % 3 === 1;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={full}
                    onClick={() => s.setSlot(t)}
                    aria-pressed={on}
                    style={{
                      padding: 14,
                      borderRadius: r.field,
                      border: `2px solid ${on ? c.forest : c.line}`,
                      background: full ? c.fullBg : on ? c.pickedBg : c.white,
                      color: full ? c.faint : c.ink,
                      cursor: full ? "not-allowed" : "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      textAlign: "left",
                      transition: "border-color .2s,background .2s",
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{t}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: full ? c.faint : eco ? c.good : c.muted,
                      }}
                    >
                      {full ? "Fully booked" : eco ? "Eco slot · van nearby" : "Available"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={3} title="Payment">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                gap: 10,
              }}
            >
              {PAYMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => s.setPay(p.id)}
                  aria-pressed={s.pay === p.id}
                  style={{
                    textAlign: "left",
                    padding: 16,
                    borderRadius: r.img,
                    border: `2px solid ${s.pay === p.id ? c.forest : c.line}`,
                    background: c.white,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{p.label}</span>
                  <span style={{ fontSize: 13, color: c.muted }}>{p.sub}</span>
                </button>
              ))}
            </div>

            {delivery && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: c.muted,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  Tip your driver · 100% goes to them
                </span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TIPS.map((v) => (
                    <Pill
                      key={v}
                      label={v ? `$${v}` : "None"}
                      on={s.tip === v}
                      onClick={() => s.setTip(v)}
                    />
                  ))}
                </div>
              </div>
            )}

            <label style={labelStyle}>
              Notes for your shopper
              <textarea
                value={s.note}
                onChange={(e) => s.setNote(e.target.value)}
                placeholder="e.g. Greenest bananas you can find, please"
                style={{
                  minHeight: 80,
                  borderRadius: r.field,
                  border: `1.5px solid ${c.lineInput}`,
                  background: c.white,
                  padding: "12px 16px",
                  fontSize: 15,
                  color: c.ink,
                  textTransform: "none",
                  letterSpacing: 0,
                  resize: "vertical",
                }}
              />
            </label>
          </Step>
        </div>

        <aside
          className="checkoutSummary"
          style={{
            position: "sticky",
            top: 130,
            background: c.forest,
            color: c.cream,
            borderRadius: r.card,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: font.display,
              fontWeight: 400,
              fontSize: 34,
              textTransform: "uppercase",
            }}
          >
            Your order
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxHeight: 260,
              overflow: "auto",
            }}
          >
            {s.lines.map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={photo(l.product.img, 200)}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
                />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
                  {l.qty} × {l.product.name}
                </span>
                <span style={{ fontSize: 14 }}>{money(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              paddingTop: 14,
              borderTop: "1px solid rgba(244,238,225,.2)",
              fontSize: 15,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span>{s.totals.subTxt}</span>
            </div>
            {s.totals.hasDiscount && (
              <div
                style={{ display: "flex", justifyContent: "space-between", color: c.amber }}
              >
                <span>{PROMO_CODE}</span>
                <span>−{s.totals.discTxt}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{s.totals.feeLabel}</span>
              <span>{s.totals.feeTxt}</span>
            </div>
            {delivery && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Driver tip</span>
                <span>{s.totals.tipTxt}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingTop: 10,
                borderTop: "1px solid rgba(244,238,225,.2)",
              }}
            >
              <span style={{ fontWeight: 800 }}>Total</span>
              <span style={{ fontFamily: font.display, fontSize: 36 }}>
                {s.totals.totalTxt}
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              color: c.onDark,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ fontWeight: 800, color: c.cream }}>
              {s.slot ? `${dd?.long ?? ""}, ${s.slot}` : "Choose a time slot"}
            </span>
            <span>
              {delivery
                ? s.address
                : `Collect at ${s.currentStore.name}, ${s.currentStore.addr}`}
            </span>
          </div>

          <button
            type="button"
            onClick={s.placeOrder}
            disabled={s.lines.length === 0}
            className="lift"
            style={{
              height: 60,
              borderRadius: r.pill,
              border: 0,
              background: c.amber,
              color: c.ink,
              fontWeight: 800,
              fontSize: 16,
              cursor: s.lines.length === 0 ? "not-allowed" : "pointer",
              opacity: s.lines.length === 0 ? 0.5 : 1,
              transition: "transform .2s",
            }}
          >
            Place order · {s.totals.totalTxt}
          </button>
          <span style={{ fontSize: 12, color: c.onForestSoft, textAlign: "center" }}>
            You're only charged after your shopper packs your order.
          </span>
        </aside>
      </div>
    </main>
  );
}
