import { c } from "../theme";

/**
 * The circle-and-dot pointer.
 *
 * `mix-blend-mode: difference` is what makes one ring work on a black page,
 * a white photograph and a red hover row without ever picking a colour — it
 * inverts whatever is behind it. The consequence is that the ring must be
 * white to invert to black, which is why it is not themed.
 *
 * It is only mounted where there is a pointer to replace: useScrollFx checks
 * `(hover: hover) and (pointer: fine)` and sets `data-cursor` on the root,
 * and `App` only renders this when that check passed. On a phone the real
 * cursor was never hidden, so nothing is missing.
 */
export function Cursor() {
  return (
    <>
      <div
        data-cursor-ring
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          margin: "-18px 0 0 -18px",
          border: `1px solid ${c.ink}`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 90,
          mixBlendMode: "difference",
          transition: "width .3s, height .3s, margin .3s, background .3s",
        }}
      />
      <div
        data-cursor-dot
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          margin: "-3px 0 0 -3px",
          background: c.red,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 91,
        }}
      />
    </>
  );
}
