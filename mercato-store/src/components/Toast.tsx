import { c, ease, r } from "../theme";
import { BY, photo } from "../data";
import type { StoreApi } from "../useStore";

/**
 * The basket confirmation.
 *
 * It stays mounted and animates between states rather than mounting on each
 * add, so a second add while the first is still up slides the words rather
 * than flashing the whole pill. That is also why it keeps showing the last
 * product's photograph after `toast` clears — there is nothing else to show
 * during the half-second it takes to leave.
 */
export function Toast({ s }: { s: StoreApi }) {
  const shown = !!s.toast;
  const product = BY[s.toast?.id ?? "avo"];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        zIndex: 99,
        transform: shown ? "translate(-50%,0)" : "translate(-50%,24px)",
        opacity: shown ? 1 : 0,
        transition: `transform .5s ${ease.drawer},opacity .4s`,
        pointerEvents: shown ? "auto" : "none",
        background: c.ink,
        color: c.cream,
        borderRadius: r.pill,
        padding: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 20px 40px -16px rgba(0,0,0,.5)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <img
        src={photo(product?.img ?? "", 120)}
        alt=""
        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {s.toast?.msg ?? ""}
      </span>
      <button
        type="button"
        onClick={s.openCart}
        style={{
          height: 40,
          padding: "0 16px",
          borderRadius: r.pill,
          border: 0,
          background: c.amber,
          color: c.ink,
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        View basket
      </button>
    </div>
  );
}
