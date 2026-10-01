/** The seven views. There is no router — see `useStore`. */
export type Page = "home" | "shop" | "product" | "custom" | "about" | "showroom" | "contact";

export type Sort = "featured" | "low" | "high" | "new";

export interface Product {
  id: string;
  name: string;
  cat: string;
  /** KES, inclusive. */
  price: number;
  material: string;
  /** The upholstery or finish, in the shop's own words. */
  fabric: string;
  colours: string[];
  dims: string;
  /** "Bestseller" | "New" | "" — drawn as a pill on the card. */
  tag: string;
  best: 0 | 1;
  /** Position under the "Featured" sort. */
  order: number;
  /** Pexels photo id. */
  img: number;
  /** The block colour behind the photograph while it loads. */
  tone: string;
  desc: string;
}

export interface Zone {
  name: string;
  days: string;
  areas: string[];
  /** Either the literal "free" or a printed fee. */
  fee: string;
}

export interface Review {
  text: string;
  name: string;
  meta: string;
}

export interface Craftsman {
  name: string;
  role: string;
  bio: string;
  tone: string;
  /** What the photograph would show. No portrait ships — see `data.ts`. */
  shot: string;
}

export interface Material {
  name: string;
  from: string;
  body: string;
}

export interface Room {
  name: string;
  meta: string;
  tone: string;
  img: number;
  cat: string;
}
