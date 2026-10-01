import { BRAND_NAME } from "./config";
import { BRAND_GREEN } from "./theme";
import { wa, useStore } from "./useStore";
import { useReveal } from "./useReveal";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MpesaModal, QuickView } from "./components/Modals";
import { About } from "./screens/About";
import { Contact } from "./screens/Contact";
import { Custom } from "./screens/Custom";
import { Home } from "./screens/Home";
import { Product } from "./screens/Product";
import { Shop } from "./screens/Shop";
import { Showroom } from "./screens/Showroom";

export default function App() {
  const store = useStore();

  // Each view is a fresh set of nodes, so the reveal observer re-scans
  // whenever the page changes — and when the shop's result set does, since
  // filtering swaps the cards underneath it.
  useReveal([store.page, store.pid, store.cat, store.sort, store.mats.length, store.cols.length, store.band]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)" }}>
      <Header store={store} />

      <main>
        {store.page === "home" && <Home store={store} />}
        {store.page === "shop" && <Shop store={store} />}
        {store.page === "product" && <Product store={store} />}
        {store.page === "custom" && <Custom store={store} />}
        {store.page === "about" && <About store={store} />}
        {store.page === "showroom" && <Showroom />}
        {store.page === "contact" && <Contact store={store} />}
      </main>

      <Footer store={store} />

      {/*
        The floating WhatsApp button sits higher on a product page, where a
        sticky buy bar already occupies the bottom of a phone screen — the
        design's own `waBottom`, and the reason it is not simply `16px`.
      */}
      <a
        className="fab"
        href={wa(`Hi ${BRAND_NAME}! I found you online and would like to ask about your furniture.`)}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        style={{
          position: "fixed",
          right: 16,
          bottom: store.page === "product" && !store.desktop ? 90 : 20,
          zIndex: 60,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: BRAND_GREEN.whatsapp,
          color: BRAND_GREEN.whatsappInk,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 12px 28px -8px rgba(6,43,22,.5)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 4.8 5-1.3A9.8 9.8 0 1 0 12 2.2Zm5.6 13.8c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-3.8-1-3.2-1.4-5.2-4.7-5.4-4.9-.2-.2-1.3-1.7-1.3-3.3S6 6 6.3 5.7c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l1 2.3c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.7.3.2.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.2.6.4.1.1.1.7-.2 1.4Z" />
        </svg>
      </a>

      {store.quick && <QuickView store={store} />}
      {store.mpesaOpen && <MpesaModal store={store} />}
    </div>
  );
}
