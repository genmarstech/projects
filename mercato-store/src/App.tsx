import { useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { ProductModal } from "./components/ProductModal";
import { Toast } from "./components/Toast";
import { Home } from "./screens/Home";
import { Shop } from "./screens/Shop";
import { Checkout } from "./screens/Checkout";
import { Track } from "./screens/Track";
import { useStore } from "./useStore";
import { useReveal, useScrollFx } from "./useScrollFx";

/**
 * The whole storefront: one page, four views, no router.
 *
 * The header, the basket drawer, the product sheet and the toast sit outside
 * the view because they belong to the shop rather than to a screen. The
 * drawer and the sheet in particular stay mounted on every view — they have
 * exit animations, and a screen change must not cut one in half.
 */
export function App() {
  const s = useStore();
  const refs = useScrollFx(s.view === "home");

  // Changing screen starts you at the top of the new one. Carrying the scroll
  // position across lands you halfway down a checkout you have not read.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [s.view]);

  // Re-observe on anything that adds a `data-reveal` node: a new screen, a
  // best-seller tab, a different shelf.
  useReveal([s.view, s.bestTab, s.cat, s.sort, s.query]);

  return (
    <>
      <Header s={s} headerRef={refs.header} />
      {s.view === "home" && <Home s={s} refs={refs} />}
      {s.view === "shop" && <Shop s={s} />}
      {s.view === "checkout" && <Checkout s={s} />}
      {s.view === "track" && <Track s={s} />}
      <Footer s={s} />
      <CartDrawer s={s} />
      <ProductModal s={s} />
      <Toast s={s} />
    </>
  );
}
