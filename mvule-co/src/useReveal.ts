import { useEffect } from "react";

/**
 * Fade-and-rise for anything marked `data-reveal`.
 *
 * ── WHY IT RE-SCANS ON EVERY PAGE CHANGE ────────────────────────────────────
 *
 * The seven views are mounted and unmounted, not routed to, so each change
 * puts a fresh set of nodes on the page. The hook takes the page as a
 * dependency and scans again; elements it has already seen carry
 * `data-reveal="in"` and are skipped.
 *
 * Only elements that start below the fold are hidden. One already on screen
 * is marked shown immediately — otherwise the top of a freshly-rendered view
 * sits blank, waiting for an intersection that will never be observed
 * because it already intersects.
 */
export function useReveal(deps: unknown[]) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const pending = nodes.filter((el) => !el.dataset.reveal || el.dataset.reveal === "");
    if (!pending.length) return;

    const show = (el: HTMLElement) => (el.dataset.reveal = "in");

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          show(e.target as HTMLElement);
        }),
      { threshold: 0.1 },
    );

    pending.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.reveal = "pending";
        io.observe(el);
      } else {
        show(el);
      }
    });

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
