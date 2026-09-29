export type Category =
  | "Produce"
  | "Bakery"
  | "Dairy"
  | "Meat"
  | "Drinks"
  | "Snacks"
  | "Ready meals";

/** The three the shop filters on. A product may carry any combination. */
export type Diet = "Organic" | "Vegan" | "Local";

export interface Product {
  id: string;
  name: string;
  cat: Category;
  price: number;
  /** Was-price. Its presence is what makes an item a deal. */
  was?: number;
  unit: string;
  origin: string;
  /** Unsplash photo id, expanded by `photo()`. */
  img: string;
  /** The card ground behind the photo, chosen per product. */
  bg: string;
  diet: Diet[];
  /** An explicit badge overrides the computed "Save N%". */
  badge?: string;
  desc: string;
}

export type View = "home" | "shop" | "checkout" | "track";
export type Mode = "Delivery" | "Pickup";
export type Sort = "featured" | "low" | "high" | "az";
export type ProductTab = "About" | "Nutrition" | "Storage";

/** What to do when the shopper cannot find the thing you ordered. */
export type SubPref = "best" | "call" | "none";

/** Basket contents: product id to quantity. Absent means not in the basket. */
export type Cart = Record<string, number>;

export interface OrderLine {
  id: string;
  name: string;
  qty: number;
  thumb: string;
  lineTxt: string;
}

export interface Order {
  no: string;
  slot: string;
  lines: OrderLine[];
  totalTxt: string;
}

export interface Toast {
  /** Product whose photo sits in the toast. */
  id: string;
  msg: string;
}
