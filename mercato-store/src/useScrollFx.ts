import { useEffect, useRef } from "react";
import { PINNED_RAIL } from "./config";

/**
 * Every scroll-linked effect on the home page, driven from one handler.
 *
 * ── WHY ONE HANDLER AND NOT SIX ─────────────────────────────────────────────
 *
 * Five layers move with the scroll position: the hero's text, its photograph,
 * the vertical word behind it, the harvest rail, and the recipe photograph.
 * Each is a transform written straight to the node — no state, no re-render.
 * Six independent scroll listeners would each schedule their own frame and
 * read layout separately, which is six forced reflows per frame instead of
 * one. They share a single rAF-throttled pass.
 *
 * ── THE PINNED RAIL ─────────────────────────────────────────────────────────
 *
 * The harvest rail scrolls sideways as the page scrolls down. It works by
 * making the outer section as tall as the viewport plus the track's overflow
 * width, sticking the inner frame to the top, and mapping how far the outer
 * section has travelled onto how far the track should translate. Scrolling
 * the height of the overflow therefore scrolls the rail end to end.
 *
 * Below 700px this is switched off and the rail scrolls natively, because on
 * a phone the rail is most of the viewport: a thumb-swipe down would move
 * pictures sideways instead of moving the page, and a person who cannot
 * scroll past a section concludes the site is broken. The design only ever
 * drew this at desktop width, so there is nothing to be unfaithful to.
 */

/** The narrowest viewport that still gets the scroll-driven rail. */
const PIN_MIN_WIDTH = 700;

/**
 * How far a rail photograph may drift inside its frame, each way.
 *
 * It has to match the horizontal overscan the frames are drawn with — see
 * `PAR_OVERSCAN` in `HarvestRail`. Drift further than the overscan and the
 * photograph's edge appears inside the frame.
 */
const PAR_LIMIT = 40;

/**
 * Whether the viewer has asked for less movement.
 *
 * Read per frame rather than cached, because the setting can change while the
 * page is open and the cost is a matched-media lookup against a frame that is
 * already doing layout work.
 */
const calm = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface ScrollRefs {
  header: React.RefObject<HTMLElement | null>;
  heroText: React.RefObject<HTMLDivElement | null>;
  heroImg: React.RefObject<HTMLDivElement | null>;
  heroVert: React.RefObject<HTMLDivElement | null>;
  railOuter: React.RefObject<HTMLElement | null>;
  railSticky: React.RefObject<HTMLDivElement | null>;
  railScroll: React.RefObject<HTMLDivElement | null>;
  railTrack: React.RefObject<HTMLDivElement | null>;
  railBar: React.RefObject<HTMLDivElement | null>;
  recipe: React.RefObject<HTMLElement | null>;
  recipeImg: React.RefObject<HTMLImageElement | null>;
}

/**
 * @param active false on any screen but the home page, where none of these
 *   nodes are mounted and the work would be a wasted frame per scroll event.
 */
export function useScrollFx(active: boolean): ScrollRefs {
  const refs: ScrollRefs = {
    header: useRef<HTMLElement | null>(null),
    heroText: useRef<HTMLDivElement | null>(null),
    heroImg: useRef<HTMLDivElement | null>(null),
    heroVert: useRef<HTMLDivElement | null>(null),
    railOuter: useRef<HTMLElement | null>(null),
    railSticky: useRef<HTMLDivElement | null>(null),
    railScroll: useRef<HTMLDivElement | null>(null),
    railTrack: useRef<HTMLDivElement | null>(null),
    railBar: useRef<HTMLDivElement | null>(null),
    recipe: useRef<HTMLElement | null>(null),
    recipeImg: useRef<HTMLImageElement | null>(null),
  };

  const frame = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const vw = document.documentElement.clientWidth;
      const headerH = refs.header.current?.offsetHeight ?? 110;

      // Reduced motion turns off everything the scroll drives. That is the
      // pinned rail as much as the parallax: scroll-jacking is the strongest
      // version of the movement this setting is asking us not to make.
      const still = calm();

      const text = refs.heroText.current;
      if (text && !still) {
        text.style.transform = `translate3d(0,${y * 0.22}px,0)`;
        // Faded out by nine tenths of a viewport, so the headline is gone
        // before the categories arrive rather than overlapping them.
        text.style.opacity = String(Math.max(0, 1 - y / (vh * 0.9)));
      }

      const img = refs.heroImg.current;
      if (img && !still) {
        img.style.transform = `translate3d(0,${y * -0.06}px,0) rotate(${Math.min(y * 0.008, 6)}deg)`;
      }

      const vert = refs.heroVert.current;
      if (vert && !still) vert.style.transform = `translate3d(0,${y * -0.3}px,0)`;

      const outer = refs.railOuter.current;
      const sticky = refs.railSticky.current;
      const track = refs.railTrack.current;
      if (outer && sticky && track) {
        const pinned = PINNED_RAIL && vw > PIN_MIN_WIDTH && !still;
        const dist = Math.max(0, track.scrollWidth - vw);

        if (pinned) {
          const h = vh - headerH;
          sticky.style.position = "sticky";
          sticky.style.top = `${headerH}px`;
          sticky.style.height = `${h}px`;
          outer.style.height = `${h + dist}px`;

          const rect = outer.getBoundingClientRect();
          const p = dist ? Math.min(1, Math.max(0, (headerH - rect.top) / dist)) : 0;
          track.style.transform = `translate3d(${-p * dist}px,0,0)`;
          if (refs.railBar.current) {
            refs.railBar.current.style.transform = `scaleX(${p})`;
          }
          // A second, slower pass inside each card, offset by its position in
          // the track, so the photographs drift against their own frames as
          // the rail travels rather than moving as one rigid strip.
          //
          // Clamped to the overscan the frames actually carry (PAR_LIMIT each
          // side, see HarvestRail). Unclamped the drift reaches eighty-odd
          // pixels at the ends of the rail, and the photograph pulls away
          // from its own frame leaving a strip of card showing.
          track.querySelectorAll<HTMLElement>("[data-par]").forEach((node, i) => {
            const raw = (p * dist - i * 300) * -0.04;
            const off = Math.max(-PAR_LIMIT, Math.min(PAR_LIMIT, raw));
            node.style.translate = `${off}px 0`;
          });
        } else {
          sticky.style.position = "relative";
          sticky.style.top = "auto";
          sticky.style.height = "auto";
          outer.style.height = "auto";
          track.style.transform = "none";
          const scroller = refs.railScroll.current;
          if (scroller && refs.railBar.current) {
            const max = scroller.scrollWidth - scroller.clientWidth;
            refs.railBar.current.style.transform = `scaleX(${max ? scroller.scrollLeft / max : 0})`;
          }
        }
      }

      const recipe = refs.recipe.current;
      const recipeImg = refs.recipeImg.current;
      if (recipe && recipeImg && !still) {
        const rect = recipe.getBoundingClientRect();
        const p = (rect.top + rect.height / 2 - vh / 2) / vh;
        recipeImg.style.transform = `translate3d(0,${p * -60}px,0) scale(1.04)`;
      }
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        tick();
      });
    };

    if (!active) return;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // The horizontal scroller only exists in the unpinned case, but attaching
    // unconditionally is cheaper than re-attaching on every resize past 700px.
    const scroller = refs.railScroll.current;
    scroller?.addEventListener("scroll", onScroll, { passive: true });

    // Layout has to have happened before the first measurement, and the fonts
    // have not necessarily loaded. One frame is enough for the geometry.
    const first = window.setTimeout(tick, 50);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      scroller?.removeEventListener("scroll", onScroll);
      window.clearTimeout(first);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
    // The refs are stable across renders; `active` is the only real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return refs;
}

/**
 * Reveal-on-scroll for anything carrying `data-reveal`.
 *
 * The node ships with its resting state inline (`revealFrom` in the theme) and
 * this clears it once the node is 10% into the viewport, using the attribute's
 * value as the transition delay so a row of cards staggers.
 *
 * The delay is then wiped after the transition. Left in place it would apply
 * to every later transition on that node — a card that hovers 270ms after the
 * pointer arrives feels broken.
 */
export function useReveal(deps: unknown[]) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.transitionDelay = el.dataset.reveal || "0ms";
          el.style.opacity = "1";
          el.style.transform = "none";
          window.setTimeout(() => {
            el.style.transitionDelay = "0ms";
          }, 1400);
          io.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-seen])").forEach((el) => {
      el.setAttribute("data-seen", "");
      io.observe(el);
    });

    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
