import { useCallback, useEffect, useRef, useState } from "react";

import { SERVICE_END, SERVICE_START } from "./sim";

/**
 * The only thing in this application that accumulates.
 *
 * Everything else is a function of the number this returns — see the banner
 * in `sim.ts`. Keeping the accumulation in one hook is what makes that true:
 * there is exactly one place where "a bit of time passed" turns into state,
 * and `setMinute` from a scrubber enters by the same door.
 */
export const useClock = (playing: boolean, rate: number) => {
  const [minute, setMinute] = useState(7 * 60 + 20);
  const minuteRef = useRef(minute);
  minuteRef.current = minute;

  const reduced = useReducedMotion();

  useEffect(() => {
    if (!playing) return;

    let raf = 0;
    let last = performance.now();
    let sinceCommit = 0;

    /*
     * Under prefers-reduced-motion the clock still runs — stopping it would
     * remove the thing the page is for — but it commits four times a second
     * instead of sixty. The vehicles then step rather than glide, which is
     * the distinction that setting is actually asking for: motion that
     * tracks the eye, versus a display that updates.
     */
    const commitEvery = reduced ? 250 : 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      sinceCommit += dt;

      if (sinceCommit >= commitEvery) {
        const next = minuteRef.current + (sinceCommit / 60_000) * rate;
        sinceCommit = 0;
        // The day loops rather than ending on an empty board.
        minuteRef.current = next > SERVICE_END ? SERVICE_START : next;
        setMinute(minuteRef.current);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, rate, reduced]);

  const jump = useCallback((to: number) => {
    minuteRef.current = to;
    setMinute(to);
  }, []);

  return { minute, jump, reduced };
};

export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return reduced;
};

/**
 * Whether the page is currently dark.
 *
 * The canvas needs this as a boolean, not as a stylesheet rule: it picks
 * different route lightnesses for the two grounds, and `readPalette` has to
 * be called again when the answer changes or the drawing keeps one theme's
 * ink on the other's ground.
 */
export const useDarkTheme = (): boolean => {
  const [dark, setDark] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return dark;
};
