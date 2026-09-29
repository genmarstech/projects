import { c, r } from "../theme";

/**
 * The confirmation strip.
 *
 * `role="status"` with `aria-live="polite"` so a screen reader hears
 * "Shopper assigned" — without it the only feedback for half the actions on
 * this dashboard is a visual one, and several of them (advancing an order,
 * issuing a refund) are things you want confirmed.
 *
 * It stays mounted and slides out, rather than unmounting, so the exit
 * transition can run.
 */
export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", left: "50%", bottom: 24, zIndex: 99,
        transform: message ? "translate(-50%, 0)" : "translate(-50%, 20px)",
        opacity: message ? 1 : 0,
        transition: "transform .5s cubic-bezier(.2,.8,.2,1), opacity .4s",
        pointerEvents: "none",
        background: c.ink, color: c.cream, borderRadius: r.pill,
        padding: "14px 22px", fontSize: 14, fontWeight: 700,
        boxShadow: "0 20px 40px -16px rgba(0,0,0,.5)", whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
