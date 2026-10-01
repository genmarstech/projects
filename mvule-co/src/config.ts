/**
 * The design file's editor props, as constants.
 *
 * ── WHY THESE ARE NOT PROPS, AND WHY THEY ARE STILL HERE ────────────────────
 *
 * `Mvule & Co Website.dc.html` exposed seven knobs grouped into Brand,
 * Business and Footer. There is no editor on a deployed site, so a prop panel
 * would be a control nobody can reach — but unlike the other projects in this
 * repository, these are not decoration. The design is explicitly a
 * *rebrandable template*: its own stylesheet opens with "edit here to
 * rebrand", and `palette` and `fontPairing` each offer three complete
 * schemes. Keeping all three in `theme.ts` and selecting one here preserves
 * what the template is for.
 *
 * To rebrand: change `BRAND_NAME`, `PALETTE` and `FONT_PAIRING`. Nothing else
 * needs to move — every colour and face on the page is a CSS custom property
 * written from those three values.
 */

export const BRAND_NAME = "Mvule & Co.";

/** One of the keys of `PALETTES` in theme.ts. */
export const PALETTE = "Mvule terracotta";

/** One of the keys of `FONT_PAIRINGS` in theme.ts. */
export const FONT_PAIRING = "Gloock + Hanken Grotesk";

/**
 * The number every WhatsApp link opens, digits only, international format.
 *
 * ⚠ THIS IS A PLACEHOLDER AND IT IS A DIALABLE NUMBER. 0712 345 678 is the
 *   conventional Kenyan stand-in, the way 555-0100 is in the United States,
 *   but Safaricom has no reserved test range — the number may well belong to
 *   somebody. Replace it before this is shown to anyone who might tap it.
 */
export const WHATSAPP_NUMBER = "254712345678";

/** Order value, in KES, above which delivery inside Nairobi is free. */
export const FREE_DELIVERY_FROM = 50000;

/** The thin strip above the header. */
export const SHOW_ANNOUNCEMENT = true;

/**
 * Where "Website by Genmars Tech" points.
 *
 * The design defaulted to `https://genmarstech.com`. The company's site is
 * `genmars.co.ke` — the other domain is not ours to link to.
 */
export const CREDIT_URL = "https://genmars.co.ke";

/** Above this width the layout is the desktop one. The design's own number. */
export const DESKTOP_WIDTH = 1024;
