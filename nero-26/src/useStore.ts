import { useCallback, useEffect, useState } from "react";
import { COMPOUNDS, GALLERY } from "./data";

/**
 * The only four things on this page that are state.
 *
 * ── WHY SO LITTLE ───────────────────────────────────────────────────────────
 *
 * Almost everything that moves here is driven by scroll, and none of it goes
 * through React: the telemetry, the hotspots, the cursor, the two WebGL
 * scenes and every parallax offset are written straight to nodes from one
 * rAF pass in `useScrollFx`. Routing any of that through `useState` would
 * re-render the page on every frame to set a number nobody diffed.
 *
 * What is left is genuinely discrete — a chosen compound, a chosen livery,
 * an open lightbox, a submitted form — and those re-render exactly once each.
 */
export function useStore() {
  const [compound, setCompound] = useState(0);
  const [livery, setLivery] = useState(0);
  /** Index into GALLERY, or -1 for closed. */
  const [lightbox, setLightbox] = useState(-1);
  const [subscribed, setSubscribed] = useState(false);

  const openLightbox = useCallback((i: number) => setLightbox(i), []);
  const closeLightbox = useCallback(() => setLightbox(-1), []);
  const stepLightbox = useCallback((d: number) => {
    setLightbox((i) => (i < 0 ? i : (i + d + GALLERY.length) % GALLERY.length));
  }, []);

  // Escape and the arrow keys, bound only while the lightbox is open. Binding
  // them permanently would make the arrow keys unusable everywhere else.
  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "ArrowLeft") stepLightbox(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox, stepLightbox]);

  // The page behind a lightbox must not scroll. Without this, arrow keys and
  // a trackpad move the gallery underneath the image you are looking at.
  useEffect(() => {
    if (lightbox < 0) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  return {
    compound,
    setCompound,
    compoundData: COMPOUNDS[compound]!,
    livery,
    setLivery,
    lightbox,
    openLightbox,
    closeLightbox,
    stepLightbox,
    subscribed,
    subscribe: useCallback(() => setSubscribed(true), []),
  };
}

export type StoreApi = ReturnType<typeof useStore>;
