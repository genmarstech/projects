/**
 * The sample data, generated rather than shipped.
 *
 * ── WHY IT IS CSV TEXT AND NOT A PREBUILT TABLE ──────────────────────────
 *
 * It would be faster to construct the column store directly. It is built as
 * CSV and handed to the same reader a dropped file goes through, so the
 * demonstration exercises the parser rather than bypassing it. A sample
 * dataset that takes a different code path to the user's own is a sample
 * dataset that can be green while the real thing is broken.
 *
 * Sixty thousand rows of till lines is about 4 MB of text, generated in
 * roughly a tenth of a second. Shipping it as a file would be 4 MB over the
 * wire to show what a column store does with data somebody already has.
 *
 * ⚠ INVENTED. These are not anybody's takings. The towns are real, the
 *   product names are generic, and the figures come out of the generator
 *   below — which is seeded, so the same page shows the same numbers to
 *   everybody.
 */

const BRANCHES: [string, string][] = [
  ["Nairobi CBD", "Nairobi"],
  ["Westlands", "Nairobi"],
  ["Kasarani", "Nairobi"],
  ["Nakuru Town", "Nakuru"],
  ["Eldoret", "Uasin Gishu"],
  ["Kisumu Lakeside", "Kisumu"],
  ["Mombasa Nyali", "Mombasa"],
  ["Thika", "Kiambu"],
  ["Machakos", "Machakos"],
  ["Nyeri", "Nyeri"],
];

const CATALOGUE: [string, string, number][] = [
  ["Staples", "Maize flour 2 kg", 185],
  ["Staples", "Rice 5 kg", 980],
  ["Staples", "Wheat flour 2 kg", 230],
  ["Staples", "Cooking oil 3 L", 720],
  ["Staples", "Sugar 2 kg", 340],
  ["Dairy", "Fresh milk 500 ml", 65],
  ["Dairy", "Yoghurt 500 ml", 140],
  ["Dairy", "Butter 250 g", 320],
  ["Produce", "Tomatoes 1 kg", 120],
  ["Produce", "Onions 1 kg", 95],
  ["Produce", "Sukuma wiki bunch", 30],
  ["Produce", "Avocado, each", 40],
  ["Household", "Bar soap 800 g", 210],
  ["Household", "Detergent 1 kg", 395],
  ["Household", "Tissue, 10 pack", 480],
  ["Beverages", "Tea leaves 500 g", 520],
  ["Beverages", "Instant coffee 100 g", 690],
  ["Beverages", "Soda 500 ml", 70],
  ["Airtime", "Airtime 100", 100],
  ["Airtime", "Airtime 500", 500],
];

const PAYMENTS = ["M-Pesa", "Cash", "Card"];
const CASHIERS = ["Achieng", "Barasa", "Chepkoech", "Mutiso", "Njoki", "Otieno", "Wafula"];

const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const SAMPLE_ROWS = 60_000;

export const sampleCsv = (rows = SAMPLE_ROWS, seed = 0x6d697a61): string => {
  const next = rng(seed);
  const out: string[] = [
    "date,branch,county,category,product,qty,unit_price,total,payment,cashier",
  ];

  const start = Date.UTC(2026, 3, 1);
  const days = 180;

  for (let i = 0; i < rows; i += 1) {
    // Weekends carry more lines than weekdays, and December is not in the
    // window, so the shape is a mild weekly cycle rather than a flat
    // scatter. A sample where every GROUP BY comes back level teaches
    // nobody anything about their own data.
    let day = Math.floor(next() * days);
    const weekday = new Date(start + day * 86_400_000).getUTCDay();
    if ((weekday === 0 || weekday === 6) && next() < 0.35) day = Math.floor(next() * days);

    const date = new Date(start + day * 86_400_000).toISOString().slice(0, 10);
    const [branch, county] = BRANCHES[Math.floor(next() ** 1.4 * BRANCHES.length)];
    const [category, product, base] = CATALOGUE[Math.floor(next() * CATALOGUE.length)];

    const qty = category === "Airtime" ? 1 : 1 + Math.floor(next() ** 2.2 * 6);
    // Branch pricing drifts a little, which is what makes AVG interesting.
    const unit = Math.round(base * (0.96 + next() * 0.1));
    const total = unit * qty;

    const payment =
      category === "Airtime"
        ? "M-Pesa"
        : PAYMENTS[next() < 0.62 ? 0 : next() < 0.8 ? 1 : 2];

    out.push(
      `${date},${branch},${county},${category},"${product}",${qty},${unit},${total},${payment},${
        CASHIERS[Math.floor(next() * CASHIERS.length)]
      }`,
    );
  }

  return out.join("\n");
};

export const EXAMPLES: { label: string; sql: string; note: string }[] = [
  {
    label: "Takings by branch",
    note: "One scan, one integer-keyed group, two columns touched out of ten.",
    sql: "SELECT branch, SUM(total) AS takings, COUNT(*) AS lines\nFROM sales\nGROUP BY branch\nORDER BY takings DESC",
  },
  {
    label: "M-Pesa share by category",
    note: "A dictionary equality on payment, resolved to one integer before the scan.",
    sql: "SELECT category, COUNT(*) AS lines, SUM(total) AS value\nFROM sales\nWHERE payment = 'M-Pesa'\nGROUP BY category\nORDER BY value DESC",
  },
  {
    label: "Basket size where it matters",
    note: "AVG over a filtered scan. Note how few bytes the plan says it read.",
    sql: "SELECT branch, AVG(total) AS mean_line, MAX(total) AS largest\nFROM sales\nWHERE qty > 2 AND county IN ('Nairobi', 'Nakuru', 'Kisumu')\nGROUP BY branch\nORDER BY mean_line DESC",
  },
  {
    label: "A filter that matches nothing",
    note: "“Kitale” is not in the branch dictionary, so the predicate is false for every row and the scan never runs.",
    sql: "SELECT product, SUM(qty) AS units\nFROM sales\nWHERE branch = 'Kitale'\nGROUP BY product",
  },
  {
    label: "Raw rows",
    note: "No grouping. Ten columns projected, which is the slow shape — and the plan says so.",
    sql: "SELECT date, branch, product, qty, total\nFROM sales\nWHERE total > 3000 AND product LIKE '%oil%'\nORDER BY total DESC\nLIMIT 50",
  },
];
