import type { CSSProperties, ReactNode } from "react";
import { c, ease, font, r } from "../theme";
import { money, photo } from "../data";
import type { Product } from "../types";

/**
 * The controls the design repeats, as components.
 *
 * Each one appears three or more times in `Mercato Grocery.dc.html` with the
 * same styling and a different ground. Where the design varied a value — the
 * stepper is 44px tall on a card and 54px in the modal — the variation is a
 * prop, so the two cannot drift apart.
 */

/** A deal's discount, as the design computes it: "Save 15%". */
export function saveBadge(p: Product): string {
  if (p.badge) return p.badge;
  if (!p.was) return "";
  return `Save ${Math.round((1 - p.price / p.was) * 100)}%`;
}

export function Badge({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        background: c.tomato,
        color: c.onTomato,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        padding: "5px 9px",
        borderRadius: 6,
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * A selected/unselected pill. The design uses this shape for the shop's
 * category filters, the best-seller tabs, the delivery-mode switch and the
 * tip amounts — always ink-on-transparent until chosen, then inverted.
 */
export function Pill({
  label,
  on,
  onClick,
  height = 42,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  height?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height,
        padding: "0 18px",
        borderRadius: r.pill,
        border: `1.5px solid ${c.ink}`,
        background: on ? c.ink : "transparent",
        color: on ? c.cream : c.ink,
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "background .25s,color .25s",
      }}
    >
      {label}
    </button>
  );
}

/**
 * The quantity control. Three grounds appear in the design: solid ink on a
 * harvest card, solid forest on a product card, and outlined in the basket
 * and the modal.
 */
export function Stepper({
  qty,
  inc,
  dec,
  ground = "outline",
  size = 44,
}: {
  qty: number;
  inc: () => void;
  dec: () => void;
  ground?: "ink" | "forest" | "outline";
  size?: number;
}) {
  const solid = ground !== "outline";
  const btn: CSSProperties = {
    width: size - 4,
    height: size,
    border: 0,
    background: "none",
    color: "inherit",
    fontSize: size > 46 ? 20 : 18,
    cursor: "pointer",
    lineHeight: 1,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: size,
        borderRadius: r.pill,
        background: ground === "ink" ? c.ink : ground === "forest" ? c.forest : "transparent",
        color: solid ? c.cream : c.ink,
        border: solid ? 0 : `1.5px solid ${c.ink}`,
      }}
    >
      <button type="button" onClick={dec} style={btn} aria-label="One fewer">
        –
      </button>
      <span style={{ minWidth: 22, textAlign: "center", fontWeight: 800 }}>{qty}</span>
      <button type="button" onClick={inc} style={btn} aria-label="One more">
        +
      </button>
    </div>
  );
}

/**
 * The product card, in the two forms the design draws.
 *
 * `best` carries the grower and a favourite heart; `shop` carries the
 * department and lifts on hover. Everything else — the photograph, the badge,
 * the was-price, the add control — is shared, which is why they are one
 * component: the design drew them twice and they already differed by a
 * pixel in the corner radius.
 */
export function ProductCard({
  product,
  qty,
  variant,
  delay,
  fav,
  onFav,
  onOpen,
  onAdd,
  onInc,
  onDec,
}: {
  product: Product;
  qty: number;
  variant: "best" | "shop";
  /** Stagger for the reveal, on the best-seller grid only. */
  delay?: string;
  fav?: boolean;
  onFav?: () => void;
  onOpen: () => void;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const badge = saveBadge(product);
  const best = variant === "best";

  return (
    <article
      {...(delay ? { "data-reveal": delay } : {})}
      className={best ? "prodCard" : "prodCardRaise"}
      style={{
        ...(delay
          ? { opacity: 0, transform: "translateY(40px)" }
          : {}),
        transition: `opacity .9s ease,transform .9s ${ease.travel},box-shadow .3s`,
        background: c.panel,
        border: `1px solid ${c.lineCard}`,
        borderRadius: r.card,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        className="zoomFrameLg"
        onClick={onOpen}
        style={{
          position: "relative",
          aspectRatio: "1/1",
          borderRadius: r.img,
          overflow: "hidden",
          background: c.lineCard,
          cursor: "pointer",
        }}
      >
        <img
          className="zoomImg"
          src={photo(product.img, 700)}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: `transform .8s ${ease.travel}`,
          }}
        />
        {badge && <Badge style={{ position: "absolute", top: 10, left: 10 }}>{badge}</Badge>}
        {best && onFav && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFav();
            }}
            aria-label={fav ? `Remove ${product.name} from favourites` : `Save ${product.name}`}
            aria-pressed={fav}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: 0,
              background: c.cream,
              color: fav ? c.tomato : c.ink,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={fav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
            </svg>
          </button>
        )}
      </div>

      <div
        style={{
          padding: "0 6px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            fontSize: 12,
            color: c.muted,
            fontWeight: 700,
          }}
        >
          <span>{best ? product.origin : product.cat}</span>
          <span>{product.unit}</span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: best ? 18 : 17,
            lineHeight: 1.2,
            color: c.ink,
          }}
        >
          {product.name}
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: best ? 20 : 19, fontWeight: 800 }}>
              {money(product.price)}
            </span>
            {product.was && (
              <span style={{ fontSize: 13, color: c.faint, textDecoration: "line-through" }}>
                {money(product.was)}
              </span>
            )}
          </div>

          {qty === 0 ? (
            <button
              type="button"
              className="addOutline"
              onClick={onAdd}
              style={{
                height: 44,
                padding: "0 18px",
                borderRadius: r.pill,
                border: `1.5px solid ${c.ink}`,
                background: "transparent",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                transition: "background .2s,color .2s",
              }}
            >
              Add
            </button>
          ) : (
            <Stepper qty={qty} inc={onInc} dec={onDec} ground="forest" size={44} />
          )}
        </div>
      </div>
    </article>
  );
}

/** The heading treatment every section shares: uppercase Anton, one word in italic serif. */
export function SectionHeading({
  before,
  accent,
  after,
  accentColor = c.tomato,
  style,
}: {
  before?: string;
  accent: string;
  after?: string;
  accentColor?: string;
  style?: CSSProperties;
}) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: font.display,
        fontWeight: 400,
        textTransform: "uppercase",
        fontSize: "clamp(46px,6vw,92px)",
        lineHeight: 0.9,
        textWrap: "balance",
        ...style,
      }}
    >
      {before ? `${before} ` : ""}
      <span
        style={{
          fontFamily: font.word,
          fontStyle: "italic",
          textTransform: "none",
          color: accentColor,
        }}
      >
        {accent}
      </span>
      {after ? ` ${after}` : ""}
    </h2>
  );
}
