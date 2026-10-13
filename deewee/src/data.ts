/**
 * Copy, prices and quiz logic — carried over verbatim from the Claude
 * Design handoff (`DeeWee Website.dc.html`'s own `<script type="text/x-dc">`
 * block). Nothing here is invented; it is the same object literals, typed.
 */

export type Product = {
  id: "oil" | "butter" | "ritual";
  name: string;
  price: number;
  priceLabel: string;
  tag: string;
  img: string;
  fit: "contain" | "cover";
  bg: string;
  inset: string;
  blend: "multiply" | "normal";
  sub: string;
  tags: string[];
  cta: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "oil",
    name: "Growth Oil",
    price: 650,
    priceLabel: "KES 650",
    tag: "Bestseller",
    img: "/assets/bottle.png",
    fit: "contain",
    bg: "#f6efe2",
    inset: "6% 12% 0",
    blend: "multiply",
    sub: "Our signature blend for thinning edges, slow growth and postpartum shedding. Precision nozzle drips straight to the scalp.",
    tags: ["Edges", "Length", "Scalp"],
    cta: "Add to basket",
  },
  {
    id: "butter",
    name: "Whipped Hair Butter",
    price: 900,
    priceLabel: "KES 900",
    tag: "Moisture",
    img: "/assets/butter.png",
    fit: "cover",
    bg: "#0e0b07",
    inset: "0",
    blend: "normal",
    sub: "Rich, whipped and melt-on-touch. Seals in moisture after wash day so twists, locs and afros stay soft for days.",
    tags: ["Dryness", "Breakage"],
    cta: "Add to basket",
  },
  {
    id: "ritual",
    name: "The Full Ritual",
    price: 1450,
    priceLabel: "KES 1,450",
    tag: "Save KES 100",
    img: "/assets/bottle.png",
    fit: "contain",
    bg: "#f0c24b",
    inset: "8% 14% 0",
    blend: "multiply",
    sub: "Growth Oil + Whipped Butter. Oil feeds the scalp, butter protects the length — the routine our regulars swear by.",
    tags: ["Oil + Butter", "Best value"],
    cta: "Add the ritual",
  },
];

export type Concern = { id: "edges" | "growth" | "breakage" | "scalp"; label: string; hint: string };

export const CONCERNS: Concern[] = [
  { id: "edges", label: "Thinning edges", hint: "My hairline is pulling back" },
  { id: "growth", label: "Slow growth", hint: "Length stuck for months" },
  { id: "breakage", label: "Dry & breaking", hint: "Shedding, split ends" },
  { id: "scalp", label: "Itchy, flaky scalp", hint: "Build-up and irritation" },
];

export type HairStyle = { id: "natural" | "locs" | "braids" | "relaxed"; label: string; hint: string };

export const STYLES: HairStyle[] = [
  { id: "natural", label: "Natural / afro", hint: "Out and free" },
  { id: "locs", label: "Locs or twists", hint: "Including sisterlocks" },
  { id: "braids", label: "Braids / protective", hint: "Lines, cornrows, weaves" },
  { id: "relaxed", label: "Relaxed", hint: "Chemically straightened" },
];

export const RESULTS: Record<Concern["id"], { headline: string; pid: Product["id"]; steps: string[] }> = {
  edges: {
    headline: "Bring those edges home.",
    pid: "oil",
    steps: [
      "Drip 3–4 drops along the hairline every night.",
      "Massage with fingertips — not nails — for two minutes.",
      "Ease off tight styles and heavy gels for a few weeks.",
    ],
  },
  growth: {
    headline: "Grow it — and keep it.",
    pid: "ritual",
    steps: [
      "Oil the scalp 3–4 times a week, massaging well.",
      "Seal the ends with butter after every wash day.",
      "Trim only when ends split; protect at night with satin.",
    ],
  },
  breakage: {
    headline: "Softness first, length follows.",
    pid: "ritual",
    steps: [
      "Wash, then apply butter to damp hair to lock moisture in.",
      "Oil the scalp twice a week to strengthen from the root.",
      "Detangle gently, ends to roots, with fingers.",
    ],
  },
  scalp: {
    headline: "A calm scalp grows better hair.",
    pid: "oil",
    steps: [
      "Start with a clean scalp — clear old product build-up.",
      "Drip oil directly onto the scalp twice a week.",
      "Massage lightly; skip heavy products for now.",
    ],
  },
};

export const STYLE_TIP: Record<HairStyle["id"], string> = {
  natural: "Seal with butter after wash day so your afro stays moisturised all week.",
  locs: "Use the nozzle to part-and-drip between locs — no residue, no mess.",
  braids: "Apply along the partings every 2–3 days — no need to take your braids down.",
  relaxed: "Keep oil off a fresh relaxer for 48 hours, then follow the routine.",
};

export type Review = { text: string; tr?: string; who: string; time: string };

export const REVIEWS: Review[] = [
  { text: "This hair has been thriving and growing like weeds thanks to your oil! Thank you so so so much!", who: "Wanjiru", time: "07:10" },
  { text: "Two weeks in tumeanza kumea! Hii nayo imenitoa mbali.", tr: "Two weeks in and it’s growing! This one has really taken me far.", who: "Yvette", time: "21:42" },
  { text: "It’s fuller in terms of volume and longer in length! Your product is EXACTLY what it thinks it is and does what it’s supposed to do!", who: "Akinyi", time: "07:12" },
  { text: "Hairline imerudi na vile ilikuwa imeisha yote kabisa. Will refer you to my colleagues.", tr: "My hairline is back — and it had completely gone.", who: "Mercy", time: "13:01" },
  { text: "Heh it’s exactly 2 weeks since I made my purchase and all I can say is a ghurl is happy. Your oil is working magic.", who: "Faith", time: "11:24" },
  { text: "Basically I’ve had great hair but the oil has played a big role. These are fancy matutas done on my natural hair, no added extension.", who: "Njeri", time: "18:05" },
  { text: "Heyyy, will be coming for another serum — yangu imeisha. Dewee has really helped me sanasana.", tr: "Mine is finished. DeeWee has really, really helped me.", who: "Achieng", time: "13:01" },
];

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  { q: "How soon will I see results?", a: "Most customers notice softer hair and less shedding in the first two weeks. New growth along the edges usually shows between weeks 4 and 8 with consistent nightly use." },
  { q: "I’m experiencing postpartum hair loss. Can it help?", a: "Yes — postpartum shedding is one of the most common reasons people visit us. Gentle nightly scalp massage with Growth Oil helps support regrowth. Chat with us on WhatsApp for a routine." },
  { q: "Can I use it with braids, locs or a weave?", a: "Absolutely. The precision nozzle lets you apply straight to the scalp along your partings, so you never have to take your style down." },
  { q: "Is it safe for children?", a: "Our oils are 100% natural, and many parents use them on their kids’ hair. Do a small patch test first and use a few drops at a time." },
  { q: "How do I pay and receive my order?", a: "Pay via M-Pesa Paybill 400200, account 892668, then send your order on WhatsApp. Pick up at Star Mall, 2nd floor, Shop B7, or ask us about delivery." },
  { q: "Is it really made in Kenya?", a: "Every bottle is blended locally in small batches. 100% natural, 100% Kenyan." },
];

export type Cause = { n: string; title: string; body: string };

export const CAUSES: Cause[] = [
  { n: "01", title: "Poor scalp care", body: "Hair grows from the scalp. A dry, neglected or clogged scalp can’t grow strong hair — no matter what goes on the ends." },
  { n: "02", title: "Tight hairstyles", body: "Heavy braids and tight lines pull at the hairline over time. Edges are always the first to tell you." },
  { n: "03", title: "Product build-up", body: "Layers of gels, creams and sprays suffocate follicles. Less product, better product, cleaner scalp." },
];

export function fmt(n: number): string {
  return "KES " + n.toLocaleString("en-KE");
}

export const WHATSAPP_NUMBER = "254705472849";
