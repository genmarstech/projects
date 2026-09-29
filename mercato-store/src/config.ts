/**
 * The three things the design file exposed as editor props.
 *
 * In the design they were knobs on a canvas: somebody dragging the threshold
 * slider and watching the basket recompute. There is no canvas here, so they
 * are constants — but they stay named and in one file rather than being
 * inlined, because each one is a commercial decision somebody will want to
 * change, not an implementation detail.
 */

/** Rotate the hero every 6.5s. Off means the three slides only advance on a click. */
export const HERO_AUTOPLAY = true;

/**
 * Scroll-drive the harvest rail sideways instead of letting it scroll natively.
 *
 * Below 700px this is ignored regardless — see `useScrollFx`. Hijacking the
 * page scroll on a phone, where the rail is most of the viewport, means a
 * thumb-swipe down does something other than scroll down.
 */
export const PINNED_RAIL = true;

/** Basket subtotal, before discount, above which delivery is free. */
export const FREE_DELIVERY_THRESHOLD = 50;

/** Flat delivery fee below the threshold. Collection is always free. */
export const DELIVERY_FEE = 4.99;

/** The one promotional code the demo honours, for 10% off groceries. */
export const PROMO_CODE = "FRESH10";
export const PROMO_RATE = 0.1;

/**
 * The staff side of the same shop, linked from the footer.
 *
 * The design linked to `Mercato Admin.dc.html`, a sibling file in the design
 * project. Here the sibling is a separate deployment, so this is its stable
 * production alias rather than a relative path that would 404.
 */
export const ADMIN_URL = "https://mercato-admin-gules.vercel.app";
