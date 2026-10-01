import type { Craftsman, Material, Product, Review, Room, Zone } from "./types";

/**
 * Everything the shop says and sells.
 *
 * ── MVULE & CO. IS NOT A REAL BUSINESS ──────────────────────────────────────
 *
 * This is a demonstration site: an invented Nairobi furniture brand, built to
 * show what a Kenyan retailer's shopfront could look like. The workshop, the
 * fundis, the reviews, the showroom on Lantana Road and the prices are all
 * written for the demo.
 *
 * Two things in here could cost a stranger real money if they are taken at
 * face value, so neither is left as the design had it:
 *
 *   • The paybill. The design printed business number "247 247", which is a
 *     real Kenyan paybill belonging to somebody else. A visitor following
 *     those steps with a KES 145,000 amount in front of them would be sending
 *     money to a real institution. `PAYBILL` below is deliberately not a
 *     working number and the modal says so in as many words.
 *
 *   • The phone number. 0712 345 678 is the conventional Kenyan placeholder,
 *     but Safaricom reserves no test range, so it may belong to someone.
 *     See `WHATSAPP_NUMBER` in config.ts.
 */

/** Pexels CDN address for a photo id, at the width the layout asks for. */
export const px = (id: number, w = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** "KES 145,000". Kenyan grouping, no decimals — nobody prices a sofa in cents. */
export const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-KE")}`;

export const CATEGORIES = ["Sofas", "Beds", "Dining", "Office", "Outdoor", "Decor"];
export const MATERIALS = ["Mvule", "Mahogany", "Cypress", "Sisal", "Cotton"];

/** [label, min, max) — the shop's own price bands, in KES. */
export const PRICE_BANDS: [string, number, number][] = [
  ["Under 20K", 0, 20000],
  ["20K – 80K", 20000, 80000],
  ["80K – 150K", 80000, 150000],
  ["150K+", 150000, 1e9],
];

export const PRODUCTS: Product[] = [
  { id: "naivasha-sofa", name: "Naivasha 3-Seater Sofa", cat: "Sofas", price: 145000, material: "Mvule", fabric: "Linen-cotton blend", colours: ["Sand", "Terracotta", "Olive"], dims: "W 220 × D 92 × H 80 cm", tag: "Bestseller", best: 1, order: 1, img: 2041003, tone: "#CDB594", desc: "Deep, generous seats on a solid mvule frame, with feather-wrapped cushions and removable, washable covers. Our most-loved piece for Nairobi living rooms." },
  { id: "kilimani-corner", name: "Kilimani Modular Corner", cat: "Sofas", price: 238000, material: "Mahogany", fabric: "Textured bouclé", colours: ["Cream", "Charcoal", "Sand"], dims: "W 290 × D 210 × H 78 cm", tag: "New", best: 1, order: 2, img: 2029663, tone: "#C9B69E", desc: "Five modules you can arrange as an L, a U or two sofas — ideal for open-plan apartments and Airbnbs that change layout often." },
  { id: "lamu-chair", name: "Lamu Lounge Chair", cat: "Sofas", price: 68500, material: "Sisal", fabric: "Hand-woven Taita sisal", colours: ["Natural", "Walnut"], dims: "W 72 × D 80 × H 76 cm", tag: "", best: 0, order: 5, img: 2332909, tone: "#D5C2A2", desc: "A low, wide reading chair with a mvule frame and a seat hand-woven from Taita sisal. Pairs beautifully with a kikoy throw." },
  { id: "mara-bed", name: "Mara King Bed", cat: "Beds", price: 189000, material: "Mvule", fabric: "Upholstered headboard, linen", colours: ["Sand", "Olive", "Charcoal"], dims: "6 × 6 ft · H 120 cm headboard", tag: "Bestseller", best: 1, order: 3, img: 5002329, tone: "#C8B08E", desc: "A solid mvule bed with a tall padded headboard and hidden centre support rail — built to take a heavy mattress for decades." },
  { id: "ruaka-bed", name: "Ruaka Queen Bed", cat: "Beds", price: 112000, material: "Cypress", fabric: "Solid timber", colours: ["Natural", "Walnut"], dims: "5 × 6 ft · H 95 cm headboard", tag: "", best: 0, order: 8, img: 7303688, tone: "#D9C8AE", desc: "Clean-lined cypress bed with slatted base. A lighter, more affordable frame that is perfect for first apartments." },
  { id: "karura-table", name: "Karura 6-Seater Dining Table", cat: "Dining", price: 164000, material: "Mvule", fabric: "Live-edge slab, oil finish", colours: ["Walnut", "Natural"], dims: "L 200 × W 95 × H 76 cm", tag: "Bestseller", best: 1, order: 4, img: 4044798, tone: "#BFA27E", desc: "Cut from a single mvule slab and finished with food-safe oil. Every grain pattern is different — we will send you a photo of yours before delivery." },
  { id: "tana-chairs", name: "Tana Dining Chair — pair", cat: "Dining", price: 38000, material: "Mahogany", fabric: "Woven sisal seat", colours: ["Walnut", "Natural"], dims: "W 48 × D 52 × H 82 cm", tag: "", best: 0, order: 6, img: 2079233, tone: "#CDB79A", desc: "Mahogany dining chairs with a hand-woven sisal seat. Sold as a pair; mix with the Karura table for a full set." },
  { id: "westlands-desk", name: "Westlands Executive Desk", cat: "Office", price: 96000, material: "Mahogany", fabric: "Brass cable ports", colours: ["Walnut", "Charcoal"], dims: "W 160 × D 75 × H 75 cm", tag: "", best: 0, order: 7, img: 1957477, tone: "#D3C3AB", desc: "A solid mahogany desk with two soft-close drawers and brass cable management. Available in bulk for office fit-outs." },
  { id: "ngong-chair", name: "Ngong Study Chair", cat: "Office", price: 42500, material: "Cypress", fabric: "Leather-look seat", colours: ["Terracotta", "Charcoal"], dims: "W 56 × D 58 × H 84 cm", tag: "New", best: 0, order: 9, img: 5824534, tone: "#D6C6AE", desc: "Comfortable all-day seating for home offices, with a curved backrest and cushioned seat." },
  { id: "diani-chair", name: "Diani Rope Terrace Set", cat: "Outdoor", price: 74000, material: "Mvule", fabric: "Outdoor rope, weatherproof", colours: ["Olive", "Sand"], dims: "2 chairs + table · W 60 cm", tag: "", best: 0, order: 10, img: 3848879, tone: "#C9C1A0", desc: "Treated mvule and marine-grade rope that handles Nairobi sun and coastal humidity alike. Great for balconies and Airbnb terraces." },
  { id: "watamu-patio", name: "Watamu Garden Dining Set", cat: "Outdoor", price: 128000, material: "Mvule", fabric: "Treated timber", colours: ["Natural", "Olive"], dims: "Table L 180 cm + 6 chairs", tag: "", best: 0, order: 11, img: 785080, tone: "#BFB894", desc: "A long garden table with six chairs, sealed for outdoor use. Built for Sunday nyama choma." },
  { id: "taita-baskets", name: "Taita Sisal Storage Baskets", cat: "Decor", price: 6500, material: "Sisal", fabric: "Hand-woven sisal", colours: ["Natural", "Terracotta"], dims: "Set of 3 · Ø 25 / 32 / 40 cm", tag: "", best: 0, order: 12, img: 8581052, tone: "#DCCDB4", desc: "Woven by a women-led cooperative in Taita Taveta. Perfect for throws, toys and plants." },
  { id: "kiondo-trio", name: "Kiondo Basket Trio", cat: "Decor", price: 12500, material: "Sisal", fabric: "Sisal & leather", colours: ["Natural", "Olive", "Terracotta"], dims: "Set of 3 · H 30 – 45 cm", tag: "New", best: 0, order: 13, img: 31794673, tone: "#D8C4A2", desc: "Traditional kiondo weaving in earthy tones, finished with leather handles." },
  { id: "kikoy-cushions", name: "Kikoy Cushion Set", cat: "Decor", price: 5800, material: "Cotton", fabric: "Coastal kikoy cotton", colours: ["Terracotta", "Olive", "Sand"], dims: "Set of 2 · 50 × 50 cm", tag: "", best: 0, order: 14, img: 15558114, tone: "#D2BFA3", desc: "Striped kikoy covers with feather inserts. An easy way to bring the coast into your living room." },
];

/** Extra photographs, used to pad each product's gallery out to four. */
export const EXTRA_SHOTS = [6510425, 11125359, 19689230, 1743229, 106936, 12703093, 7851906, 2332909];

export const ZONES: Zone[] = [
  { name: "Nairobi — inner", days: "1–2 days", areas: ["Westlands", "Kilimani", "Lavington", "Kileleshwa", "Parklands", "CBD", "Upper Hill"], fee: "free" },
  { name: "Nairobi — outer", days: "2–3 days", areas: ["Karen", "Runda", "Ruaka", "Syokimani", "Kitengela", "Rongai", "Embakasi"], fee: "KES 2,500" },
  { name: "Nairobi metro", days: "2–4 days", areas: ["Kiambu", "Thika", "Machakos", "Ngong", "Juja"], fee: "KES 4,000" },
  { name: "Countrywide", days: "3–7 days", areas: ["Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Other towns"], fee: "Courier — quoted on WhatsApp" },
];

/** Block colours behind photographs, cycled through the grids. */
export const TILE_TONES = ["#C9B294", "#D2BFA3", "#BFA27E", "#D3C3AB", "#C9C1A0", "#DCCDB4"];
/** One photograph per category, in the order of `CATEGORIES`. */
export const CATEGORY_SHOTS = [7851906, 6510425, 11125359, 12703093, 785080, 31794673];

export const TRUST = [
  { title: "Made in Kenya", body: "Handcrafted in our Kariobangi workshop" },
  { title: "5-year warranty", body: "On every frame and joint we build" },
  { title: "Lipa pole pole", body: "Reserve with 40% deposit via M-Pesa" },
  { title: "Visit the showroom", body: "Lantana Road, Westlands — 7 days" },
];

export const CRAFT_FACTS = [
  { n: "22", l: "Fundis in our workshop" },
  { n: "100%", l: "Kenyan timber & fibre" },
  { n: "5 yr", l: "Frame warranty" },
];

export const ROOMS: Room[] = [
  { name: "Kilimani 2-bedroom", meta: "Naivasha sofa · Lamu chair", tone: "#C9B294", img: 106936, cat: "Sofas" },
  { name: "Syokimani family home", meta: "Karura table · Tana chairs", tone: "#BFA27E", img: 11125359, cat: "Dining" },
  { name: "Westlands Airbnb", meta: "Mara king bed · Kikoy cushions", tone: "#D2BFA3", img: 1743229, cat: "Beds" },
  { name: "Upper Hill office", meta: "Westlands desk · Ngong chair", tone: "#D3C3AB", img: 12703093, cat: "Office" },
];

export const REVIEWS: Review[] = [
  { text: "The Naivasha sofa is even better in person. Delivered to Kilimani in two days and the guys assembled everything.", name: "Wanjiru M.", meta: "Kilimani · Naivasha sofa" },
  { text: "Paid the deposit on M-Pesa, balance before delivery. No stress. The mvule table is the centre of our home now.", name: "Brian & Achieng O.", meta: "Syokimani · Karura dining table" },
  { text: "I furnished three Airbnb units with them. Guests always ask where the beds are from.", name: "Aisha K.", meta: "Airbnb host · Westlands" },
  { text: "They built a 3.2m custom sofa for my client in four weeks. Joinery is excellent. My go-to workshop.", name: "Grace N.", meta: "Interior designer · Lavington" },
];

export const INSTAGRAM_SHOTS = [2332909, 6510425, 3848879, 15558114, 8581052, 5002329];

export const CUSTOM_STEPS = [
  { n: "01", t: "Share your idea", d: "Photos, sizes and budget — here or on WhatsApp." },
  { n: "02", t: "Sketch & quote", d: "A drawing, fabric options and a fixed price in 48 hours." },
  { n: "03", t: "We build it", d: "3–5 weeks in our workshop, with progress photos." },
  { n: "04", t: "Delivered & fitted", d: "Anywhere in Kenya, assembled in your space." },
];

export const CUSTOM_TYPES = ["Sofa", "Bed", "Dining table", "Chairs", "Wardrobe", "TV unit", "Office desk", "Outdoor", "Other"];
export const CUSTOM_BUDGETS = ["Under 50K", "50K – 150K", "150K – 300K", "300K+"];

/**
 * The three named craftsmen.
 *
 * ⚠ NO PORTRAITS SHIP. The design left these image slots empty, and filling
 *   them with stock photographs of strangers would attach a real person's
 *   face to an invented name and biography. The tile shows the tone and the
 *   caption of what the photograph would be, which is honest about the gap.
 */
export const CRAFTSMEN: Craftsman[] = [
  { name: "Mzee Otieno", role: "Master joiner · 31 years", bio: "Trained in Kisumu, Otieno leads our joinery and still hand-cuts every mortise on the Karura table.", tone: "#C9B294", shot: "Portrait — Mzee Otieno at his bench" },
  { name: "Achieng Wafula", role: "Upholstery lead", bio: "Achieng runs our upholstery floor and trains four apprentices each year.", tone: "#D2BFA3", shot: "Portrait — Achieng with fabric rolls" },
  { name: "Kamau Njoroge", role: "Finishing & polish", bio: "Kamau mixes our oils and waxes by hand — the reason our mvule glows.", tone: "#BFA27E", shot: "Portrait — Kamau polishing a tabletop" },
];

export const MATERIAL_NOTES: Material[] = [
  { name: "Mvule", from: "KFS-licensed plantations", body: "Dense, termite-resistant and rich in colour — East Africa's signature hardwood, used for our frames and tabletops." },
  { name: "Mahogany", from: "Certified local mills", body: "Fine, even grain for chairs, desks and details that need crisp edges." },
  { name: "Cypress", from: "Central Kenya", body: "A lighter, fast-growing softwood that keeps our entry pieces affordable." },
  { name: "Sisal", from: "Taita Taveta", body: "Hand-woven by women-led cooperatives for seats, baskets and pendants." },
  { name: "Kikoy cotton", from: "Lamu & Malindi", body: "Striped coastal cotton for cushions and throws, woven on traditional looms." },
];

export const ADDRESS = "Ground Floor, Mvule House, Lantana Road, Westlands, Nairobi";

export const HOURS = [
  { d: "Monday – Friday", t: "9:00 – 18:30" },
  { d: "Saturday", t: "10:00 – 17:00" },
  { d: "Sunday & public holidays", t: "12:00 – 16:00" },
];

export const DIRECTIONS = [
  { t: "From the CBD", b: "Take Waiyaki Way past Westlands roundabout, turn left onto Lantana Road. We are 200 m on the right." },
  { t: "By matatu", b: "Any Westlands-bound matatu from Koja or Odeon. Alight at Sarit Centre — a 6-minute walk." },
  { t: "Parking", b: "Free secure parking for visitors in our basement. Ask the askari for the showroom bay." },
];

export const SOCIALS = [
  { name: "Instagram", handle: "@mvule.co", href: "https://instagram.com" },
  { name: "TikTok", handle: "@mvule.co", href: "https://tiktok.com" },
  { name: "Facebook", handle: "Mvule & Co.", href: "https://facebook.com" },
  { name: "Pinterest", handle: "mvuleco", href: "https://pinterest.com" },
];

export const CONTACT_PHONE_DISPLAY = "0712 345 678";
export const CONTACT_EMAIL = "hello@mvule.co.ke";

/**
 * The paybill shown on the "Paybill details" tab.
 *
 * ⚠ DELIBERATELY NOT A WORKING NUMBER. The design printed 247 247, which is a
 *   real Kenyan paybill. On a public demonstration site, a real paybill
 *   beside a real-looking amount is an instruction a stranger can follow all
 *   the way to losing money. Six zeros cannot be paid to, and the modal says
 *   in plain words that nothing is charged.
 */
export const PAYBILL = "000 000";

/** The four captions a product gallery cycles through. */
export const GALLERY_CAPTIONS = [
  "Front view",
  "Detail — joinery & grain",
  "Styled in a Nairobi home",
  "Fabric & finish close-up",
];
