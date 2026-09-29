import type { Member, Order, Product, Promo, Status } from "./types";

/**
 * The seed data, transcribed from the design file.
 *
 * ════════════════════════════════════════════════════════════════════════
 * THE ORDER GENERATOR IS SEEDED, AND THAT IS NOT AN ACCIDENT.
 *
 * `rnd()` below is a linear congruential generator starting from a fixed
 * seed, so the fourteen opening orders are the same every time the page
 * loads. `Math.random()` here would mean a demo that looks different in
 * every screenshot, and a basket total that cannot be checked against
 * anything.
 * ════════════════════════════════════════════════════════════════════════
 */

/** Unsplash, sized down — these are thumbnails in a 44px box. */
export const photo = (id: string, w = 160) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const money = (n: number) => "$" + n.toFixed(2);

type Row = [string, string, string, number, string, string, number, number];

const CATALOGUE: Row[] = [
  ["avo", "Hass Avocados", "Produce", 5.5, "4-pack", "1523049673857-eb18f1d7b578", 8, 40],
  ["ban", "Organic Bananas", "Produce", 1.9, "bunch", "1571771894821-ce9b6c11b08e", 64, 60],
  ["tom", "Heirloom Vine Tomatoes", "Produce", 4.2, "per lb", "1592924357228-91a4daadcfea", 22, 40],
  ["man", "Ataulfo Mangoes", "Produce", 5.4, "3-pack", "1553279768-865429fa0078", 0, 24],
  ["car", "Rainbow Carrots", "Produce", 2.6, "bunch", "1598170845058-32b9d6a5da37", 31, 30],
  ["mel", "Seedless Watermelon", "Produce", 6.99, "each", "1589927986089-35812388d1f4", 12, 16],
  ["spn", "Baby Spinach", "Produce", 3.2, "5oz", "1576045057995-568f588f82fb", 5, 36],
  ["app", "Honeycrisp Apples", "Produce", 3.8, "per lb", "1567306226416-28f0efdc88ce", 48, 40],
  ["sdo", "Country Sourdough", "Bakery", 6.8, "800g", "1519996529931-28324d5a630e", 14, 30],
  ["rye", "Seeded Rye Loaf", "Bakery", 5.9, "700g", "1509440159596-0249088772ff", 18, 20],
  ["pas", "Morning Pastry Box", "Bakery", 12.5, "box of 6", "1486887396153-fa416526c108", 6, 12],
  ["mlk", "Whole Milk", "Dairy", 3.4, "1L", "1550583724-b2692b85b150", 42, 48],
  ["egg", "Pasture-raised Eggs", "Dairy", 6.2, "dozen", "1582722872445-44dc5f7e3c8f", 9, 36],
  ["gou", "Aged Farmhouse Gouda", "Dairy", 9.8, "200g", "1486297678162-eb2a19b0a32d", 20, 18],
  ["rib", "Grass-fed Ribeye", "Meat", 18.9, "12oz", "1603048297172-c92544798d5a", 7, 20],
  ["cbw", "Cold Brew Coffee", "Drinks", 4.75, "12oz", "1461023058943-07fcbe16d735", 36, 40],
  ["ojc", "Fresh Orange Juice", "Drinks", 5.2, "1L", "1600271886742-f049cd451bba", 15, 24],
  ["mat", "Ceremonial Matcha", "Drinks", 16, "30g", "1515823064-d6e0c04616a7", 11, 10],
  ["chp", "Sea Salt Kettle Chips", "Snacks", 3.6, "150g", "1566478989037-eec170784d0b", 54, 40],
  ["bwl", "Harvest Grain Bowl", "Ready meals", 11.5, "serves 1", "1546069901-ba9599a7e63c", 3, 20],
];

export const PRODUCTS: Product[] = CATALOGUE.map(
  ([id, name, cat, price, unit, img, stock, par], i) => ({
    id, name, cat, price, unit, img, stock, par,
    active: true,
    sku: "MC-" + (1040 + i * 7),
  }),
);

export const byId: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

/** The pipeline, in order. Cancelled sits outside it. */
export const FLOW: Status[] = ["New", "Picking", "Packed", "Out for delivery", "Delivered"];

/** [background, foreground] per status label. */
export const STATUS_COLOR: Record<string, [string, string]> = {
  New: ["#F9DFA8", "#6B4A00"],
  Picking: ["#DCE8DA", "#1F4D33"],
  Packed: ["#D6E4F0", "#1E3F5E"],
  "Out for delivery": ["#0E3B2E", "#F4EEE1"],
  "Ready for pickup": ["#0E3B2E", "#F4EEE1"],
  Delivered: ["#E6E1D3", "#3E4A44"],
  Collected: ["#E6E1D3", "#3E4A44"],
  Cancelled: ["#F3D3C8", "#8E2A1D"],
};

export const TEAM: Member[] = [
  { id: "t1", name: "Maya Reyes", role: "Personal shopper", on: true, done: 14, rating: "4.9", av: "#F2B135" },
  { id: "t2", name: "Devon Price", role: "Personal shopper", on: true, done: 11, rating: "4.8", av: "#F3D3C8" },
  { id: "t3", name: "Aiko Tanaka", role: "Personal shopper", on: true, done: 9, rating: "5.0", av: "#CFE0CF" },
  { id: "t4", name: "Sam Okafor", role: "Delivery driver", on: true, done: 17, rating: "4.9", av: "#F7E08A" },
  { id: "t5", name: "Lena Fischer", role: "Delivery driver", on: false, done: 0, rating: "4.7", av: "#D6E4F0" },
  { id: "t6", name: "Rafael Cruz", role: "Personal shopper", on: false, done: 0, rating: "4.8", av: "#EBD9B8" },
];

export const NAMES = [
  "Priya Shah", "Tom Hughes", "Grace Kim", "Marcus Bell", "Elena Rossi",
  "Noah Adler", "Fatima Noor", "Ben Carter", "Chloe Martin", "Omar Haddad",
  "Ivy Chen", "Luca Moretti", "Ruth Evans", "Kofi Mensah", "Sara Lind", "Jae Park",
];

const STREETS = [
  "214 Orchard Ln", "9 Mill Rd", "77 Ash St", "1402 Oak Ave",
  "31 Harbor Way", "560 Elm Ct", "18 Cedar Pl", "3 Birch Row",
];

export const SLOT_TIMES = ["8–10am", "10–12pm", "12–2pm", "2–4pm", "4–6pm", "6–8pm"];
export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A linear congruential generator with a fixed seed — see the banner.
 *
 * It is module-level and stateful on purpose: each generated order advances
 * it, so order 3 differs from order 2 while the whole sequence stays
 * reproducible from a cold load.
 */
let seed = 7;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

export function makeOrder(i: number, status: Status, minsAgo: number, fresh = false): Order {
  const n = 2 + Math.floor(rnd() * 5);
  const picks = [...PRODUCTS].sort(() => rnd() - 0.5).slice(0, n);
  const lines = picks.map((p) => ({
    id: p.id,
    qty: 1 + Math.floor(rnd() * 3),
    // Anything past Picking has already been taken off the shelf.
    picked: status !== "New" && status !== "Picking",
  }));
  const mode = rnd() > 0.3 ? "Delivery" : "Pickup";
  return {
    id: "o" + i,
    no: "#MC-" + (48120 + i),
    customer: NAMES[i % NAMES.length],
    address: mode === "Delivery" ? STREETS[i % STREETS.length] : "Collect · Riverside",
    phone: "(555) 01" + String(10 + i).slice(-2) + "-" + (4000 + i * 37),
    mode,
    slot: "Today, " + SLOT_TIMES[2 + (i % 4)],
    status,
    // A brand-new order has not been handed to anyone yet.
    shopper: status === "New" ? "" : TEAM[Math.floor(rnd() * 3)].id,
    minsAgo,
    lines,
    note: i % 4 === 0 ? "Greenest bananas you can find, please" : "",
    fresh,
  };
}

const OPENING: [Status, number][] = [
  ["New", 2], ["New", 5], ["New", 9],
  ["Picking", 14], ["Picking", 18], ["Picking", 22],
  ["Packed", 31], ["Packed", 38],
  ["Out for delivery", 44], ["Out for delivery", 52],
  ["Delivered", 70], ["Delivered", 95], ["Delivered", 120],
  ["Cancelled", 140],
];

export const ORDERS: Order[] = OPENING.map(([s, m], i) => makeOrder(i, s, m));

export const PROMOS: Promo[] = [
  { code: "FRESH10", pct: 10, desc: "10% off first order", uses: 312, cap: 1000, on: true },
  { code: "BULKSAVE", pct: 20, desc: "20% off orders over $120", uses: 88, cap: 250, on: true },
  { code: "BREAD5", pct: 5, desc: "5% off bakery", uses: 40, cap: 40, on: false },
  { code: "SUMMERBOX", pct: 15, desc: "15% off produce boxes", uses: 131, cap: 300, on: true },
];

/** Revenue-by-hour, per range. 15 buckets, 7am to 9pm. */
export const HOURS = ["7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const REVENUE: Record<string, number[]> = {
  Today: [120, 260, 410, 380, 520, 690, 610, 540, 580, 720, 880, 960, 640, 380, 190],
  Week: [900, 1700, 2600, 2400, 3100, 4200, 3900, 3500, 3700, 4600, 5600, 6100, 4300, 2500, 1300],
  Month: [3800, 7100, 10900, 9900, 13200, 17600, 16300, 14600, 15400, 19300, 23400, 25600, 18000, 10400, 5400],
};

export const SECTIONS: [string, string][] = [
  ["dash", "Dashboard"], ["orders", "Orders"], ["inventory", "Inventory"],
  ["slots", "Delivery slots"], ["team", "Team"], ["customers", "Customers"],
  ["promos", "Promotions"],
];

export const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("");
