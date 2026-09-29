export type Status =
  | "New"
  | "Picking"
  | "Packed"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

/** What a Pickup order's status is *called* — see `displayStatus`. */
export type StatusLabel = Status | "Ready for pickup" | "Collected";

export type Mode = "Delivery" | "Pickup";

export interface Product {
  id: string;
  name: string;
  cat: string;
  price: number;
  unit: string;
  /** Unsplash photo id; `photo(...)` builds the URL. */
  img: string;
  stock: number;
  /** Par level — the stock this shelf is meant to hold. */
  par: number;
  active: boolean;
  sku: string;
}

export interface Line {
  id: string;
  qty: number;
  picked: boolean;
}

export interface Order {
  id: string;
  no: string;
  customer: string;
  address: string;
  phone: string;
  mode: Mode;
  slot: string;
  status: Status;
  /** Team member id, or "" for unassigned. */
  shopper: string;
  minsAgo: number;
  lines: Line[];
  note: string;
  /** Set on a just-arrived order so the row can animate in once. */
  fresh: boolean;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  /** On shift. */
  on: boolean;
  done: number;
  rating: string;
  /** Avatar background. */
  av: string;
}

export interface Promo {
  code: string;
  pct: number;
  desc: string;
  uses: number;
  cap: number;
  on: boolean;
}

export type Section =
  | "dash"
  | "orders"
  | "inventory"
  | "slots"
  | "team"
  | "customers"
  | "promos";

export type Range = "Today" | "Week" | "Month";
