/**
 * Addresses this deployment cannot work out for itself.
 *
 * The storefront is the customer half of the same shop and its own Vercel
 * project, so there is no relative path from here to there — an absolute
 * address is the only thing that resolves. Its sibling holds the mirror of
 * this constant, `ADMIN_URL` in `mercato-store/src/config.ts`, pointing back.
 *
 * If either project's production alias changes, both constants move. They are
 * the only two places the pair knows about each other.
 */
export const STORE_URL = "https://mercato-store-pi.vercel.app";
