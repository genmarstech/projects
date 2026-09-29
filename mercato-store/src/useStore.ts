import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BY,
  DOW,
  RECIPE,
  STORES,
  TIMES,
  isFull,
  money,
} from "./data";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  PROMO_CODE,
  PROMO_RATE,
} from "./config";
import type {
  Cart,
  Mode,
  Order,
  ProductTab,
  Sort,
  SubPref,
  Toast,
  View,
} from "./types";

/**
 * Every piece of storefront state, and the actions that change it.
 *
 * The design computed all of this — state, derived labels, colours,
 * percentages and click handlers — in one `renderVals()` returning a few
 * hundred fields. That shape suits a template with no logic in it and is
 * wrong here: the order tracker ticks every 3.2 seconds, and each tick would
 * re-derive the shop's filtered list, the product modal's pairings and the
 * whole checkout whether or not any of them is on screen.
 *
 * So state lives here and derivation lives in the screen that needs it. The
 * one exception is `totals`, which four separate surfaces read — the header,
 * the basket drawer, the checkout summary and the place-order button — and
 * which must agree across all four or the shop has two prices.
 */

/** How long the basket toast stays up. */
const TOAST_MS = 2600;
/** How long each order-tracking stage holds before advancing. */
const TRACK_MS = 3200;
/** The shop's price slider tops out here, which also means "no maximum". */
export const MAX_PRICE = 20;

export interface Totals {
  sub: number;
  count: number;
  subTxt: string;
  hasDiscount: boolean;
  discTxt: string;
  feeLabel: string;
  feeTxt: string;
  tipTxt: string;
  total: number;
  totalTxt: string;
  /** Free-delivery nudge in the basket drawer, and the bar beneath it. */
  freeMsg: string;
  freePct: string;
}

export function useStore() {
  const [view, setView] = useState<View>("home");

  /* basket */
  const [cart, setCart] = useState<Cart>({ avo: 1, sdo: 1, cbw: 2 });
  /** Per-line substitution opt-out. Absent or true means substitutes are fine. */
  const [subs, setSubs] = useState<Record<string, boolean>>({});
  const [cartOpen, setCartOpen] = useState(false);

  /* product modal */
  const [pid, setPid] = useState<string | null>(null);
  /**
   * The modal keeps rendering the last product after it closes, so the close
   * transition has something to animate out. Without it the panel empties
   * first and then slides away.
   */
  const [lastPid, setLastPid] = useState("avo");
  const [pqty, setPqty] = useState(1);
  const [ptab, setPtab] = useState<ProductTab>("About");
  const [psub, setPsub] = useState<Record<string, SubPref>>({});

  /* shop */
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [diets, setDiets] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [bestTab, setBestTab] = useState("All");
  const [favs, setFavs] = useState<Record<string, boolean>>({});

  /* hero */
  const [hero, setHero] = useState(0);

  /* fulfilment */
  const [mode, setMode] = useState<Mode>("Delivery");
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>("4–6pm");
  const [store, setStore] = useState("s1");
  const [pay, setPay] = useState("card");
  const [tip, setTip] = useState(3);
  const [note, setNote] = useState("");
  const [address, setAddress] = useState("214 Orchard Lane, Apt 3B");

  /* promo */
  const [promo, setPromo] = useState("");
  const [promoOk, setPromoOk] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");

  /* order */
  const [order, setOrder] = useState<Order | null>(null);
  const [stage, setStage] = useState(0);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastT = useRef<number | undefined>(undefined);
  const trackT = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(toastT.current);
      window.clearInterval(trackT.current);
    },
    [],
  );

  const showToast = useCallback((id: string, msg: string) => {
    window.clearTimeout(toastT.current);
    setToast({ id, msg });
    toastT.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const qty = useCallback((id: string) => cart[id] ?? 0, [cart]);

  const setQty = useCallback((id: string, q: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });
  }, []);

  const add = useCallback(
    (id: string, n = 1) => {
      setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + n }));
      const p = BY[id];
      if (p) showToast(id, n > 1 ? `${n} × ${p.name} added` : `${p.name} added`);
    },
    [showToast],
  );

  const toggleSub = useCallback((id: string) => {
    setSubs((prev) => ({ ...prev, [id]: prev[id] === false }));
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleDiet = useCallback((d: string) => {
    setDiets((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }, []);

  const openProduct = useCallback(
    (id: string) => {
      setPid(id);
      setLastPid(id);
      setPqty(Math.max(1, qty(id)));
      setPtab("About");
    },
    [qty],
  );

  const closeProduct = useCallback(() => setPid(null), []);

  /** Navigate. Closes the drawer and the modal, because both belong to the page you left. */
  const go = useCallback((next: View) => {
    setView(next);
    setCartOpen(false);
    setPid(null);
  }, []);

  const goShop = useCallback(
    (nextCat: string, clearQuery = false) => {
      setCat(nextCat);
      if (clearQuery) setQuery("");
      go("shop");
    },
    [go],
  );

  const clearFilters = useCallback(() => {
    setDiets([]);
    setMaxPrice(MAX_PRICE);
    setQuery("");
    setCat("All");
  }, []);

  const applyPromo = useCallback(() => {
    const ok = promo.trim().toUpperCase() === PROMO_CODE;
    // A wrong code after a right one does not un-apply the discount. Somebody
    // trying a second code has not asked to lose the one that worked.
    if (ok) setPromoOk(true);
    setPromoMsg(
      ok
        ? `${PROMO_CODE} applied — 10% off your groceries.`
        : `That code isn’t valid. Try ${PROMO_CODE}.`,
    );
  }, [promo]);

  const addRecipe = useCallback(() => {
    setCart((prev) => {
      const next = { ...prev };
      RECIPE.forEach((id) => {
        next[id] = (next[id] ?? 0) + 1;
      });
      return next;
    });
    showToast("avo", `${RECIPE.length} ingredients added`);
  }, [showToast]);

  /** The next six days, starting today. Recomputed once a mount, not per render. */
  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dow = DOW[d.getDay()] ?? "";
      return {
        i,
        dow: i === 0 ? "Today" : i === 1 ? "Tmrw" : dow,
        date: String(d.getDate()),
        long: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `${dow} ${d.getDate()}`,
      };
    });
  }, []);

  const totals: Totals = useMemo(() => {
    let sub = 0;
    let count = 0;
    Object.entries(cart).forEach(([id, q]) => {
      const p = BY[id];
      if (!p) return;
      sub += p.price * q;
      count += q;
    });

    const disc = promoOk ? sub * PROMO_RATE : 0;
    const delivery = mode === "Delivery";
    // An empty basket is never charged a delivery fee. Showing $4.99 against
    // nothing reads as a fee for existing.
    const fee = count === 0 ? 0 : delivery && sub < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const driverTip = delivery && count ? tip : 0;
    const total = Math.max(0, sub - disc + fee + driverTip);
    const left = Math.max(0, FREE_DELIVERY_THRESHOLD - sub);

    return {
      sub,
      count,
      subTxt: money(sub),
      hasDiscount: disc > 0,
      discTxt: money(disc),
      feeLabel: delivery ? "Delivery" : "Click & collect",
      feeTxt: fee === 0 ? "Free" : money(fee),
      tipTxt: money(driverTip),
      total,
      totalTxt: money(total),
      freeMsg: !delivery
        ? "Click & collect is always free."
        : left > 0
          ? `You're ${money(left)} away from free delivery`
          : "Nice — your delivery is on us.",
      freePct: `${!delivery ? 100 : Math.min(100, (sub / FREE_DELIVERY_THRESHOLD) * 100)}%`,
    };
  }, [cart, promoOk, mode, tip]);

  /** Basket lines, in insertion order. Shared by the drawer and the checkout summary. */
  const lines = useMemo(
    () =>
      Object.entries(cart).flatMap(([id, q]) => {
        const p = BY[id];
        return p ? [{ id, product: p, qty: q, substitute: subs[id] !== false }] : [];
      }),
    [cart, subs],
  );

  const placeOrder = useCallback(() => {
    if (!lines.length) return;
    if (!slot) {
      showToast("avo", "Pick a time slot first");
      return;
    }
    const dd = days[day];
    setOrder({
      no: `#MC-${48210 + Math.floor(Math.random() * 900)}`,
      slot: `${dd?.long ?? ""}, ${slot}`,
      lines: lines.map((l) => ({
        id: l.id,
        name: l.product.name,
        qty: l.qty,
        thumb: l.product.img,
        lineTxt: money(l.product.price * l.qty),
      })),
      totalTxt: totals.totalTxt,
    });
    // The basket empties and the promo is spent. Leaving either behind means
    // the next shop starts with somebody else's groceries in it.
    setCart({});
    setPromo("");
    setPromoOk(false);
    setPromoMsg("");
    setStage(0);
    go("track");

    window.clearInterval(trackT.current);
    trackT.current = window.setInterval(() => {
      setStage((prev) => {
        if (prev >= 4) {
          window.clearInterval(trackT.current);
          return prev;
        }
        return prev + 1;
      });
    }, TRACK_MS);
  }, [lines, slot, days, day, totals.totalTxt, go, showToast]);

  const reorder = useCallback(() => {
    if (!order) return;
    setCart((prev) => {
      const next = { ...prev };
      order.lines.forEach((l) => {
        next[l.id] = (next[l.id] ?? 0) + l.qty;
      });
      return next;
    });
    setCartOpen(true);
  }, [order]);

  /** The first slot today that is not already booked, for the hero's live badge. */
  const nextSlot = useMemo(() => {
    const i = TIMES.findIndex((_, idx) => !isFull(0, idx));
    return TIMES[i < 0 ? TIMES.length - 1 : i] ?? "";
  }, []);

  const currentStore = STORES.find((s) => s.id === store) ?? STORES[0]!;

  return {
    view,
    go,
    goShop,
    goHome: useCallback(() => go("home"), [go]),

    cart,
    qty,
    setQty,
    add,
    lines,
    totals,
    cartOpen,
    openCart: useCallback(() => {
      setCartOpen(true);
      setToast(null);
    }, []),
    closeCart: useCallback(() => setCartOpen(false), []),
    toggleSub,

    pid,
    lastPid,
    openProduct,
    closeProduct,
    pqty,
    setPqty,
    ptab,
    setPtab,
    psub,
    setPsub,

    query,
    setQuery,
    cat,
    setCat,
    diets,
    toggleDiet,
    sort,
    setSort,
    maxPrice,
    setMaxPrice,
    clearFilters,
    bestTab,
    setBestTab,
    favs,
    toggleFav,

    hero,
    setHero,

    mode,
    setMode,
    day,
    setDay,
    slot,
    setSlot,
    days,
    store,
    setStore,
    currentStore,
    pay,
    setPay,
    tip,
    setTip,
    note,
    setNote,
    address,
    setAddress,

    promo,
    setPromo,
    promoOk,
    promoMsg,
    applyPromo,

    order,
    stage,
    placeOrder,
    reorder,
    nextSlot,
    addRecipe,

    toast,
    showToast,
  };
}

/** Named `StoreApi`, not `Store` — a `Store` in this app is a place you collect from. */
export type StoreApi = ReturnType<typeof useStore>;
