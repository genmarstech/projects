import { SWATCHES } from "../theme";
import { kes, px } from "../data";
import type { Product } from "../types";
import type { StoreApi } from "../useStore";
import { Shot } from "./ui";

/**
 * The product tile, shared by the bestseller rail, the shop grid and
 * "pairs well with".
 *
 * In the design this was its own file, `ProductCard.dc.html`, imported with
 * `<dc-import>` and handed a pre-decorated object — the card received
 * `priceLabel`, `meta`, `sw` and four callbacks already built for it. Here it
 * takes the product and derives those itself: the decoration existed because
 * the template language cannot call a function in markup, and that is not a
 * constraint React has.
 *
 * The whole tile is a button. It opens the product, so it has to be reachable
 * from a keyboard, and "Quick view" is a second button nested inside — which
 * is why that one stops the event.
 */
export function ProductCard({ product, store }: { product: Product; store: StoreApi }) {
  return (
    <button
      type="button"
      className="card"
      onClick={() => store.go("product", { pid: product.id })}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "pointer",
        minWidth: 0,
        border: 0,
        padding: 0,
        background: "transparent",
        color: "var(--c-ink)",
        textAlign: "left",
      }}
    >
      <div
        className="cardArt"
        style={{ position: "relative", aspectRatio: "4/5", borderRadius: 4, overflow: "hidden", background: product.tone, width: "100%" }}
      >
        <Shot src={px(product.img, 900)} alt={product.name} tone={product.tone} />
        {product.tag && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "5px 10px",
              borderRadius: 999,
              background: "var(--c-bg)",
              color: "var(--c-ink)",
              font: "600 10.5px/1 var(--f-body)",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              pointerEvents: "none",
            }}
          >
            {product.tag}
          </span>
        )}
        <span
          className="quickBtn"
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); store.openQuick(product.id); }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            e.stopPropagation();
            store.openQuick(product.id);
          }}
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            height: 36,
            padding: "0 14px",
            borderRadius: 999,
            background: "color-mix(in srgb, var(--c-bg) 94%, transparent)",
            color: "var(--c-ink)",
            font: "600 12px/1 var(--f-body)",
            letterSpacing: ".04em",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Quick view
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ font: "400 clamp(17px,2.2vw,20px)/1.2 var(--f-display)", color: "var(--c-ink)", textWrap: "pretty" }}>
          {product.name}
        </div>
        <div style={{ font: "400 13px/1.4 var(--f-body)", color: "var(--c-muted)" }}>
          {product.material} · {product.colours.length} colour{product.colours.length > 1 ? "s" : ""}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 2 }}>
          <div style={{ font: "600 15px/1 var(--f-body)", color: "var(--c-ink)", letterSpacing: ".01em" }}>
            {kes(product.price)}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {product.colours.map((c) => (
              <span
                key={c}
                title={c}
                style={{ width: 12, height: 12, borderRadius: "50%", background: SWATCHES[c], boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
