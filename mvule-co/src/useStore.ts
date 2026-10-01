import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND_NAME, DESKTOP_WIDTH, WHATSAPP_NUMBER } from "./config";
import { PRODUCTS, kes } from "./data";
import type { Page, Product, Sort } from "./types";

const ROUTE_KEY = "mvule.route";

/**
 * All the state, and the small amount of behaviour that is not layout.
 *
 * ── THE SHOP REMEMBERS WHERE YOU WERE ───────────────────────────────────────
 *
 * There is no router — the design is one page with seven `sc-if` branches —
 * so a reload would otherwise always land on Home, including the reload a
 * phone does when it reclaims a backgrounded tab. The page and the open
 * product are written to localStorage and read back on boot.
 *
 * Only those two. Filters, the open modal and anything half-typed are
 * deliberately not persisted: coming back to a shop with somebody's
 * fortnight-old filters applied, and no memory of setting them, reads as a
 * broken catalogue.
 */

interface Route {
  page: Page;
  pid: string;
}

function readRoute(): Route {
  const fallback: Route = { page: "home", pid: PRODUCTS[0]!.id };
  try {
    const raw = localStorage.getItem(ROUTE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<Route>;
    // Validated, not trusted: a stale id from a catalogue that has changed
    // would otherwise render a product page with nothing in it.
    const page = PAGES.includes(saved.page as Page) ? (saved.page as Page) : "home";
    const pid = PRODUCTS.some((p) => p.id === saved.pid) ? saved.pid! : fallback.pid;
    return { page, pid };
  } catch {
    return fallback;
  }
}

const PAGES: Page[] = ["home", "shop", "product", "custom", "about", "showroom", "contact"];

export function useStore() {
  const initial = useRef<Route>(undefined as unknown as Route);
  if (initial.current === undefined) initial.current = readRoute();

  const [page, setPage] = useState<Page>(initial.current.page);
  const [pid, setPid] = useState(initial.current.pid);

  // viewport
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, []);
  const desktop = width >= DESKTOP_WIDTH;

  // shop filters
  const [cat, setCat] = useState("All");
  const [band, setBand] = useState<number | null>(null);
  const [mats, setMats] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // product
  const [swatch, setSwatch] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [accordion, setAccordion] = useState(0);
  const [area, setArea] = useState("Kilimani");

  // overlays
  const [quickId, setQuickId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [payTab, setPayTab] = useState<"stk" | "paybill">("stk");
  const [plan, setPlan] = useState<"full" | "deposit">("full");
  const [stkSent, setStkSent] = useState(false);
  const [phone, setPhone] = useState("07");

  // forms
  const [customType, setCustomType] = useState("Sofa");
  const [customBudget, setCustomBudget] = useState("50K – 150K");
  const [files, setFiles] = useState<{ url: string; name: string }[]>([]);
  const [customRef, setCustomRef] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);

  const go = useCallback((next: Page, extra?: { pid?: string; cat?: string }) => {
    setPage(next);
    if (extra?.pid) setPid(extra.pid);
    if (extra?.cat !== undefined) setCat(extra.cat);
    setMenuOpen(false);
    setQuickId(null);
    setFiltersOpen(false);
    setMpesaOpen(false);
    if (extra?.pid) {
      setSwatch(null);
      setGalleryIndex(0);
      setAccordion(0);
      setStkSent(false);
    }
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_KEY, JSON.stringify({ page, pid }));
    } catch {
      // A private window, or storage the browser has refused. Losing the
      // remembered page is not worth a thrown error on every navigation.
    }
  }, [page, pid]);

  // Object URLs from the custom-order uploader are revoked when they are
  // replaced or the page goes away; without this each pick leaks a blob for
  // the lifetime of the tab.
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), [files]);

  const toggle = useCallback((set: (f: (v: string[]) => string[]) => void, v: string) => {
    set((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));
  }, []);

  const product = PRODUCTS.find((p) => p.id === pid) ?? PRODUCTS[0]!;
  const quick = quickId ? (PRODUCTS.find((p) => p.id === quickId) ?? null) : null;

  return {
    page, go, desktop, width,
    pid, product,
    cat, setCat,
    band, setBand,
    mats, toggleMat: (m: string) => toggle(setMats, m),
    cols, toggleCol: (c: string) => toggle(setCols, c),
    sort, setSort,
    filtersOpen, openFilters: () => setFiltersOpen(true), closeFilters: () => setFiltersOpen(false),
    clearFilters: () => { setCat("All"); setBand(null); setMats([]); setCols([]); },
    swatch, setSwatch,
    galleryIndex, setGalleryIndex,
    accordion, setAccordion,
    area, setArea,
    quick, openQuick: setQuickId, closeQuick: () => setQuickId(null),
    menuOpen, toggleMenu: () => setMenuOpen((v) => !v), closeMenu: () => setMenuOpen(false),
    mpesaOpen,
    openMpesa: () => { setMpesaOpen(true); setStkSent(false); },
    closeMpesa: () => setMpesaOpen(false),
    payTab, setPayTab, plan, setPlan,
    stkSent, sendStk: () => setStkSent(true),
    phone, setPhone,
    customType, setCustomType,
    customBudget, setCustomBudget,
    files, setFiles,
    customRef,
    submitCustom: () => {
      setCustomRef(`MV-C-${2400 + Math.floor(Math.random() * 500)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    resetCustom: () => { setCustomRef(null); setFiles([]); },
    contactSent, submitContact: () => setContactSent(true),
  };
}

export type StoreApi = ReturnType<typeof useStore>;

/** A wa.me link with the message already written. */
export function wa(message: string) {
  const digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** The chip states the design uses everywhere: selected is ink, the rest outlined. */
export function chip(on: boolean) {
  return on
    ? { background: "var(--c-ink)", color: "var(--c-bg)", borderColor: "var(--c-ink)" }
    : { background: "transparent", color: "var(--c-ink)", borderColor: "var(--c-line)" };
}

/** The 40% figure behind "lipa pole pole", in one place. */
export const DEPOSIT_RATE = 0.4;
export const deposit = (p: Product) => kes(p.price * DEPOSIT_RATE);

export const waProduct = (p: Product, colour: string, area?: string) =>
  wa(
    `Hi ${BRAND_NAME}, I'd like to order the ${p.name} in ${colour} (${kes(p.price)}).` +
      (area ? ` Delivery to ${area}.` : ""),
  );
