import { ease } from "../theme";

/**
 * The image that flies in beside the cursor while a calendar row is hovered.
 *
 * One node, reused for every row — the `src` is swapped on hover rather than
 * eight of these being mounted. It follows the *eased* cursor position, not
 * the raw one, so it trails the pointer slightly instead of being welded to
 * it; that lag is most of the effect.
 *
 * Hidden from assistive technology: it is a second view of the row the
 * reader is already on, and it only exists for a pointer.
 */
export function RowPreview() {
  return (
    <div
      data-preview
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "clamp(200px,22vw,340px)",
        aspectRatio: "4 / 3",
        /*
         * Centred on the cursor with a transform, not a negative margin.
         *
         * The design had `margin: -60% 0 0 24px`, and a percentage margin —
         * even a vertical one — resolves against the containing block's
         * WIDTH. On a fixed element that is the viewport, so -60% became
         * -1143px at 1905px wide and the preview sat 580px above the top of
         * the screen with `opacity: 1`, perfectly shown and impossible to
         * see. It would have looked fine on a narrow window, which is the
         * worst kind of broken.
         *
         * `translateY(-50%)` resolves against the element's own height, so
         * it centres at any size. It has to be repeated in every transform
         * this element is given — see `Calendar.tsx`.
         */
        margin: "0 0 0 24px",
        pointerEvents: "none",
        zIndex: 60,
        overflow: "hidden",
        opacity: 0,
        transform: "translateY(-50%) scale(.8) rotate(-4deg)",
        transition: `opacity .3s, transform .45s ${ease.out}`,
        boxShadow: "0 30px 80px rgba(0,0,0,.6)",
      }}
    >
      <img data-preview-img alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}
