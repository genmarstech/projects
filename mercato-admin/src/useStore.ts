import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FLOW, ORDERS, PRODUCTS, PROMOS, TEAM, byId, makeOrder,
} from "./data";
import type { Member, Order, Product, Promo, Range, Section, Status, StatusLabel } from "./types";

/**
 * All of the dashboard's state, and the actions over it.
 *
 * ════════════════════════════════════════════════════════════════════════
 * STATE LIVES HERE; DERIVED VALUES LIVE IN THE SCREENS.
 *
 * The design computed everything — colours, labels, percentages, formatted
 * totals — in one `renderVals()` that returned a few hundred fields. That
 * works for a template with no logic in it, and it is the wrong shape for
 * React: every screen re-derives on every tick of the live-order timer,
 * whether or not it is on screen.
 *
 * So this hook owns the raw state and the verbs. Each screen derives what
 * it needs from that, which means the Inventory screen does no work while
 * you are looking at Orders.
 * ════════════════════════════════════════════════════════════════════════
 */

/** A new order lands every twelve seconds while Live is on. */
const LIVE_INTERVAL_MS = 12_000;
const TOAST_MS = 2400;

export interface Store {
  section: Section;
  setSection: (s: Section) => void;
  query: string;
  setQuery: (q: string) => void;
  store: string;
  setStore: (s: string) => void;

  live: boolean;
  toggleLive: () => void;

  orders: Order[];
  products: Product[];
  team: Member[];
  promos: Promo[];

  /** The order the drawer shows, or null when it is closed. */
  openId: string | null;
  /** Kept after closing so the drawer can slide out without emptying first. */
  lastId: string;
  openOrder: (id: string) => void;
  closeOrder: () => void;

  orderFilter: string;
  setOrderFilter: (f: string) => void;
  invFilter: string;
  setInvFilter: (f: string) => void;
  range: Range;
  setRange: (r: Range) => void;

  blocked: Record<string, boolean>;
  caps: Record<string, number>;
  toggleBlocked: (key: string) => void;
  bumpCap: (key: string, current: number, by: number) => void;

  toast: string | null;
  say: (msg: string) => void;

  total: (o: Order) => number;
  /** What a Pickup order's status is called on screen. */
  displayStatus: (o: Order) => StatusLabel;

  patchOrder: (id: string, fn: (o: Order) => Order) => void;
  patchProduct: (id: string, fn: (p: Product) => Product) => void;
  advance: (o: Order) => void;
  cancelOrder: (o: Order) => void;
  assignShopper: (id: string, shopper: string) => void;
  toggleLine: (orderId: string, index: number) => void;

  restock: (id: string, by?: number) => void;
  restockAllLow: () => void;
  toggleListed: (id: string) => void;
  setPrice: (id: string, price: number) => void;
  adjustStock: (id: string, by: number) => void;

  toggleShift: (id: string) => void;
  togglePromo: (index: number) => void;
  createPromo: (code: string, pct: number, cap: number) => boolean;
}

export function useStore(): Store {
  const [section, setSection] = useState<Section>("dash");
  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [live, setLive] = useState(true);

  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [team, setTeam] = useState<Member[]>(TEAM);
  const [promos, setPromos] = useState<Promo[]>(PROMOS);

  const [openId, setOpenId] = useState<string | null>(null);
  const [lastId, setLastId] = useState("o0");
  const [orderFilter, setOrderFilter] = useState("All");
  const [invFilter, setInvFilter] = useState("All");
  const [range, setRange] = useState<Range>("Today");

  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  const [caps, setCaps] = useState<Record<string, number>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const nextIndex = useRef(ORDERS.length);

  const say = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  /*
   * The live feed. Every tick ages every order by a minute and puts a new
   * one on top — `fresh` marks it so the row animates in exactly once, and
   * is cleared from the others in the same pass.
   */
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setOrders((prev) => [
        makeOrder(nextIndex.current++, "New", 0, true),
        ...prev.map((o) => ({ ...o, minsAgo: o.minsAgo + 1, fresh: false })),
      ]);
      say("New order received");
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [live, say]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const total = useCallback(
    (o: Order) => o.lines.reduce((sum, l) => sum + byId[l.id].price * l.qty, 0),
    [],
  );

  /*
   * A Pickup order is never "out for delivery" — it is ready, and then
   * collected. The underlying status stays the same so the pipeline and the
   * filters keep working on one vocabulary; only the label changes.
   */
  const displayStatus = useCallback((o: Order): StatusLabel => {
    if (o.mode === "Pickup" && o.status === "Out for delivery") return "Ready for pickup";
    if (o.mode === "Pickup" && o.status === "Delivered") return "Collected";
    return o.status;
  }, []);

  const patchOrder = useCallback((id: string, fn: (o: Order) => Order) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? fn(o) : o)));
  }, []);

  const patchProduct = useCallback((id: string, fn: (p: Product) => Product) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const advance = useCallback(
    (o: Order) => {
      const i = FLOW.indexOf(o.status as Status);
      if (o.status === "Cancelled" || i >= FLOW.length - 1) return;
      const next = FLOW[i + 1];
      patchOrder(o.id, (x) => ({
        ...x,
        status: next,
        // Advancing an unassigned order has to give it to someone.
        shopper: x.shopper || "t1",
        // Packing means everything is off the shelf, whatever the boxes say.
        lines: next === "Packed" ? x.lines.map((l) => ({ ...l, picked: true })) : x.lines,
      }));
      say(o.no + " → " + displayStatus({ ...o, status: next }));
    },
    [patchOrder, say, displayStatus],
  );

  const cancelOrder = useCallback(
    (o: Order) => {
      const wasCancelled = o.status === "Cancelled";
      patchOrder(o.id, (x) => ({ ...x, status: wasCancelled ? "New" : "Cancelled" }));
      say(
        wasCancelled
          ? "Order restored"
          : "Refund of $" + total(o).toFixed(2) + " issued",
      );
    },
    [patchOrder, say, total],
  );

  const restock = useCallback(
    (id: string, by = 24) => {
      patchProduct(id, (p) => ({ ...p, stock: p.stock + by }));
    },
    [patchProduct],
  );

  const restockAllLow = useCallback(() => {
    setProducts((prev) =>
      prev.map((p) => (p.stock < p.par * 0.35 ? { ...p, stock: p.stock + 24 } : p)),
    );
    say("Purchase order sent for low-stock items");
  }, [say]);

  const createPromo = useCallback(
    (code: string, pct: number, cap: number) => {
      const trimmed = code.trim();
      if (!trimmed) {
        say("Enter a code first");
        return false;
      }
      setPromos((prev) => [
        { code: trimmed, pct, desc: pct + "% off sitewide", uses: 0, cap: cap || 100, on: true },
        ...prev,
      ]);
      say(trimmed + " is live on the storefront");
      return true;
    },
    [say],
  );

  return useMemo<Store>(
    () => ({
      section, setSection, query, setQuery, store, setStore,
      live, toggleLive: () => setLive((v) => !v),
      orders, products, team, promos,
      openId, lastId,
      openOrder: (id) => { setOpenId(id); setLastId(id); },
      closeOrder: () => setOpenId(null),
      orderFilter, setOrderFilter, invFilter, setInvFilter, range, setRange,
      blocked, caps,
      toggleBlocked: (key) => setBlocked((b) => ({ ...b, [key]: !b[key] })),
      bumpCap: (key, current, by) =>
        setCaps((c) => ({ ...c, [key]: Math.max(0, current + by) })),
      toast, say,
      total, displayStatus,
      patchOrder, patchProduct, advance, cancelOrder,
      assignShopper: (id, shopper) => {
        patchOrder(id, (x) => ({ ...x, shopper }));
        say("Shopper assigned");
      },
      toggleLine: (orderId, index) =>
        patchOrder(orderId, (x) => ({
          ...x,
          lines: x.lines.map((l, j) => (j === index ? { ...l, picked: !l.picked } : l)),
        })),
      restock, restockAllLow,
      toggleListed: (id) => patchProduct(id, (p) => ({ ...p, active: !p.active })),
      setPrice: (id, price) =>
        patchProduct(id, (p) => ({ ...p, price: Number.isNaN(price) ? 0 : price })),
      adjustStock: (id, by) =>
        patchProduct(id, (p) => ({ ...p, stock: Math.max(0, p.stock + by) })),
      toggleShift: (id) =>
        setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, on: !m.on } : m))),
      togglePromo: (index) =>
        setPromos((prev) => prev.map((p, j) => (j === index ? { ...p, on: !p.on } : p))),
      createPromo,
    }),
    [
      section, query, store, live, orders, products, team, promos,
      openId, lastId, orderFilter, invFilter, range, blocked, caps, toast,
      say, total, displayStatus, patchOrder, patchProduct, advance,
      cancelOrder, restock, restockAllLow, createPromo,
    ],
  );
}

/** How a product's stock reads: label, chip background, chip text, bar colour. */
export function stockState(p: Product): [string, string, string, string] {
  if (p.stock === 0) return ["Out of stock", "#F3D3C8", "#8E2A1D", "#E2412F"];
  if (p.stock < p.par * 0.35) return ["Low", "#F9DFA8", "#6B4A00", "#E0A020"];
  return ["In stock", "#DCE8DA", "#1F4D33", "#2E7D4F"];
}

export const isLow = (p: Product) => p.stock < p.par * 0.35;

/** "Just now" / "14 min ago" / "2h 5m ago". */
export function ago(mins: number) {
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + " min ago";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m ago";
}
