import type { Category, Product } from "./types";

/**
 * The shop's catalogue, transcribed from the design file unchanged.
 *
 * Prices, units, origins and copy are all the design's. They are here rather
 * than fetched because there is no server — this is a storefront built to be
 * looked at, and a seeded catalogue means the basket total in a screenshot
 * today is the basket total in a screenshot next month.
 */

/**
 * Unsplash's CDN, given a photo id.
 *
 * Width is a parameter because the same photograph appears at 120px in a
 * basket line and 1200px in the product modal, and serving the 1200 to both
 * is most of a megabyte for a thumbnail.
 */
export const photo = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/** US dollars, always two decimals. The design formats money nowhere else. */
export const money = (n: number) => "$" + n.toFixed(2);

/** The same, with a whole-dollar amount left whole: "$50", not "$50.00". */
export const roundMoney = (n: number) => money(n).replace(".00", "");

export const PRODUCTS: Product[] = [
{id:'avo',name:'Hass Avocados',cat:'Produce',price:5.5,was:6.5,unit:'4-pack',origin:'Michoacán',img:'1523049673857-eb18f1d7b578',bg:'#F6D0D6',diet:['Organic','Vegan'],badge:'Ripe today',desc:'Hand-sorted for ripeness so they are ready to slice the day they arrive. Creamy, buttery, never stringy.'},
{id:'ban',name:'Organic Bananas',cat:'Produce',price:1.9,unit:'bunch of 6',origin:'Fair trade',img:'1571771894821-ce9b6c11b08e',bg:'#F7E08A',diet:['Organic','Vegan'],desc:'Fair-trade Cavendish bananas, picked green and ripened slowly for a sweeter, fuller flavour.'},
{id:'tom',name:'Heirloom Vine Tomatoes',cat:'Produce',price:4.2,unit:'per lb',origin:'Hollow Creek Farm',img:'1592924357228-91a4daadcfea',bg:'#F3D3C8',diet:['Local','Vegan'],badge:'Peak season',desc:'Grown in open soil 40 miles away and picked on the vine this morning. Sweet, bright and deeply savoury.'},
{id:'man',name:'Ataulfo Mangoes',cat:'Produce',price:5.4,unit:'3-pack',origin:'Nayarit',img:'1553279768-865429fa0078',bg:'#F9DFA8',diet:['Vegan'],desc:'Honey mangoes with silky, fibre-free flesh. Ripe when the skin wrinkles slightly.'},
{id:'car',name:'Rainbow Carrots',cat:'Produce',price:2.6,unit:'bunch',origin:'Greenleaf Co-op',img:'1598170845058-32b9d6a5da37',bg:'#F7CDAE',diet:['Local','Organic','Vegan'],desc:'Sweet heritage carrots with the tops on. Roast whole with honey and thyme.'},
{id:'mel',name:'Seedless Watermelon',cat:'Produce',price:6.99,unit:'each, ~9lb',origin:'Rio Grande',img:'1589927986089-35812388d1f4',bg:'#DCE8DA',diet:['Vegan'],desc:'Crisp, ice-cold and tapped for ripeness by our produce team before it leaves the store.'},
{id:'spn',name:'Baby Spinach',cat:'Produce',price:3.2,unit:'5oz',origin:'Hollow Creek Farm',img:'1576045057995-568f588f82fb',bg:'#CFE0CF',diet:['Local','Organic','Vegan'],desc:'Tender leaves, triple-washed and ready to eat.'},
{id:'app',name:'Honeycrisp Apples',cat:'Produce',price:3.8,unit:'per lb',origin:'Orchard Hill',img:'1567306226416-28f0efdc88ce',bg:'#F3D3C8',diet:['Local','Vegan'],desc:'Explosively crisp, balanced sweet-tart apples from a fourth-generation orchard.'},
{id:'brc',name:'Broccoli Crowns',cat:'Produce',price:2.4,was:2.9,unit:'per lb',origin:'Greenleaf Co-op',img:'1583663848850-46af132dc08e',bg:'#CFE0CF',diet:['Local','Vegan'],desc:'Tight, deep-green florets. Blanch, roast or char on the grill.'},
{id:'sdo',name:'Country Sourdough',cat:'Bakery',price:6.8,unit:'800g loaf',origin:'Baked in-store',img:'1519996529931-28324d5a630e',bg:'#EBD9B8',diet:['Vegan'],badge:'Baked 5am',desc:'A 36-hour ferment, blistered crust and open, custardy crumb. Baked every morning at 5am.'},
{id:'rye',name:'Seeded Rye Loaf',cat:'Bakery',price:5.9,unit:'700g',origin:'Baked in-store',img:'1509440159596-0249088772ff',bg:'#EBD9B8',diet:['Vegan'],desc:'Dense, nutty and packed with sunflower, flax and caraway.'},
{id:'pas',name:'Morning Pastry Box',cat:'Bakery',price:12.5,unit:'box of 6',origin:'Baked in-store',img:'1486887396153-fa416526c108',bg:'#EBD9B8',diet:[],desc:'Croissants, pains au chocolat and seasonal danishes, laminated with cultured butter.'},
{id:'mlk',name:'Whole Milk',cat:'Dairy',price:3.4,unit:'1L glass bottle',origin:'Maple Ridge Dairy',img:'1550583724-b2692b85b150',bg:'#E6E1D3',diet:['Local'],desc:'Non-homogenised, gently pasteurised milk from grass-fed Jerseys. Bottle deposit refunded on return.'},
{id:'egg',name:'Pasture-raised Eggs',cat:'Dairy',price:6.2,unit:'dozen',origin:'Sunny Acres',img:'1582722872445-44dc5f7e3c8f',bg:'#EBD9B8',diet:['Local','Organic'],desc:'Hens roam 108 sq ft each. Rich, marigold yolks.'},
{id:'gou',name:'Aged Farmhouse Gouda',cat:'Dairy',price:9.8,unit:'200g',origin:'Netherlands',img:'1486297678162-eb2a19b0a32d',bg:'#F9DFA8',diet:[],desc:'Aged 18 months for crunchy crystals and a deep caramel finish.'},
{id:'blu',name:'Blue Stilton',cat:'Dairy',price:8.4,unit:'150g',origin:'Nottinghamshire',img:'1452195100486-9cc805987862',bg:'#E6E1D3',diet:[],desc:'Creamy, mellow blue with a lingering tang. Great with pears and honey.'},
{id:'rib',name:'Grass-fed Ribeye',cat:'Meat',price:18.9,unit:'12oz',origin:'Blackwood Ranch',img:'1603048297172-c92544798d5a',bg:'#F3D3C8',diet:['Local'],badge:'Dry-aged',desc:'Dry-aged 28 days in-house for concentrated, beefy flavour and tender bite.'},
{id:'cbw',name:'Cold Brew Coffee',cat:'Drinks',price:4.75,unit:'12oz',origin:'Roasted locally',img:'1461023058943-07fcbe16d735',bg:'#EBD9B8',diet:['Vegan','Local'],desc:'Steeped 20 hours for a smooth, chocolatey cup with low acidity.'},
{id:'ojc',name:'Fresh Orange Juice',cat:'Drinks',price:5.2,was:5.9,unit:'1L',origin:'Squeezed in-store',img:'1600271886742-f049cd451bba',bg:'#F9DFA8',diet:['Vegan'],desc:'Nothing but Valencia oranges, squeezed every morning.'},
{id:'mat',name:'Ceremonial Matcha',cat:'Drinks',price:16,unit:'30g tin',origin:'Uji, Kyoto',img:'1515823064-d6e0c04616a7',bg:'#CFE0CF',diet:['Vegan','Organic'],desc:'Stone-ground first-harvest leaves. Vivid, grassy and naturally sweet.'},
{id:'chp',name:'Sea Salt Kettle Chips',cat:'Snacks',price:3.6,unit:'150g',origin:'Small batch',img:'1566478989037-eec170784d0b',bg:'#F7E08A',diet:['Vegan'],desc:'Thick-cut, hand-stirred and seasoned with flaky sea salt.'},
{id:'bwl',name:'Harvest Grain Bowl',cat:'Ready meals',price:11.5,unit:'serves 1',origin:'Made in-store',img:'1546069901-ba9599a7e63c',bg:'#CFE0CF',diet:[],badge:'Chef made',desc:'Farro, roast chicken, pickled onion and green goddess dressing. Made fresh daily.'},
{id:'pzz',name:'Wood-fired Margherita',cat:'Ready meals',price:13,unit:'12 inch',origin:'Made in-store',img:'1565299624946-b28f40a0ae38',bg:'#F3D3C8',diet:[],desc:'San Marzano tomato, fior di latte and basil. Ready to reheat in 6 minutes.'}
];

/** Products by id. Every lookup in the app goes through this. */
export const BY: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);

/** The seven departments, in aisle order, each with its tile photograph. */
export const CATEGORIES: [Category, string][] = [
  ["Produce", "1610832958506-aa56368176cf"],
  ["Bakery", "1555507036-ab1f4038808a"],
  ["Dairy", "1563636619-e9143da7973b"],
  ["Meat", "1555939594-58d7cb561ad1"],
  ["Drinks", "1496318447583-f524534e9ce1"],
  ["Snacks", "1608198093002-ad4e005484ec"],
  ["Ready meals", "1512621776951-a57141f2eefd"],
];

export interface HeroSlide {
  /** The product this slide sells. Its price, unit and photo come from `BY`. */
  pid: string;
  tag: string;
  kicker: string;
  /** The headline, one line per element, so line two can take the accent. */
  l1: string;
  l2: string;
  l3: string;
  /** The word set vertically down the right edge, twice: outline over solid. */
  vert: string;
  bg: string;
  accent: string;
  desc: string;
}

export const HERO: HeroSlide[] = [
  {
    pid: "avo",
    tag: "Ripe today",
    kicker: "from Michoacán",
    l1: "Perfectly",
    l2: "ripe",
    l3: "avocados",
    vert: "Avocado",
    bg: "#0E3B2E",
    accent: "#F2B135",
    desc: "Hand-sorted every morning so they are ready to slice the moment they reach your door.",
  },
  {
    pid: "ban",
    tag: "Fair trade",
    kicker: "sunshine by the bunch",
    l1: "Go",
    l2: "bananas",
    l3: "for less",
    vert: "Banana",
    bg: "#17503A",
    accent: "#F7E08A",
    desc: "Fair-trade, slowly ripened and sweeter for it. Six for under two dollars, all month.",
  },
  {
    pid: "tom",
    tag: "Peak season",
    kicker: "picked this morning",
    l1: "Vine",
    l2: "ripened",
    l3: "tomatoes",
    vert: "Tomato",
    bg: "#1B2B23",
    accent: "#FF7A5C",
    desc: "Grown in open soil forty miles away and on your table the same day they leave the vine.",
  },
];

/** The scroll-driven rail on the home page. */
export const RAIL = ["tom", "avo", "man", "car", "mel", "spn", "app", "brc"];

/** Best sellers, in rank order. The tabs filter this and take the first eight. */
export const BEST = ["sdo", "avo", "egg", "cbw", "mlk", "gou", "ban", "ojc", "rib", "mat", "bwl", "chp"];

/** Everything the Sunday green bowl needs, added to the basket in one tap. */
export const RECIPE = ["spn", "avo", "egg", "sdo", "tom", "car"];
export const RECIPE_IMG = "1540420773420-3366772f4999";

/** Two-hour windows, the same six every day. */
export const TIMES = ["8–10am", "10–12pm", "12–2pm", "2–4pm", "4–6pm", "6–8pm"];

export interface Store {
  id: string;
  name: string;
  addr: string;
  dist: string;
}

export const STORES: Store[] = [
  { id: "s1", name: "Mercato Riverside", addr: "88 Canal St", dist: "0.8 mi · Ready in 1 hr" },
  { id: "s2", name: "Mercato Oak Park", addr: "1402 Oak Ave", dist: "2.1 mi · Ready in 1 hr" },
  { id: "s3", name: "Mercato Market Hall", addr: "5 Union Sq", dist: "3.4 mi · Ready in 2 hrs" },
];

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Which slots are gone.
 *
 * Today's first two are always taken — nobody books an 8am slot at 4pm — and
 * one slot in five is full on later days. It is arithmetic rather than a
 * random draw so the checkout grid is the same on every load.
 */
export const isFull = (day: number, i: number) =>
  (day === 0 && i < 2) || ((day * 3 + i) % 5 === 0 && day > 0);
