import { useEffect, useRef, type RefObject } from "react";
import { HOTSPOTS, LIVERIES, TOTAL_LAPS } from "./data";
import { CUSTOM_CURSOR, LOADER_MS, MOTION, PIN_MIN_WIDTH, POINTER_QUERY, SHOW_LOADER } from "./config";
import type { CarScene } from "./three/car";
import type { TyreScene } from "./three/tyre";

/**
 * Every moving part of the page, in one rAF pass.
 *
 * ── WHY THIS QUERIES THE DOM INSTEAD OF HOLDING REFS ────────────────────────
 *
 * There are about twenty nodes here that change on scroll, and threading a
 * ref for each one through six section components would put this file's
 * concerns into all of them. The design marked its moving parts with data
 * attributes and looked them up once on mount; that idiom is kept, so a
 * section component stays a description of its markup and the fact that the
 * background word slides is entirely this file's business.
 *
 * The rule that makes it safe: everything below WRITES to nodes and never
 * reads React state. Nothing here re-renders anything.
 *
 * ── REDUCED MOTION TURNS OFF THE PINNING, NOT JUST THE PARALLAX ─────────────
 *
 * Two sections here are scroll-jacked — 420vh and 300vh of scrolling that
 * moves a camera rather than the page. That is the strongest form of the
 * motion `prefers-reduced-motion` asks us not to make, so honouring the
 * setting for the fades and not for the pin would miss the point entirely.
 * The same switch runs below `PIN_MIN_WIDTH`, where a pinned section is most
 * of a phone screen and a thumb-swipe down would rotate a car sideways.
 */

export interface ScrollFxOptions {
  /** Current livery index, read every frame — never a dependency. */
  liveryRef: RefObject<number>;
  /** Current compound stripe colour. Pushed to the tyre on change. */
  compoundColor: string;
}

export function useScrollFx(root: RefObject<HTMLDivElement | null>, opts: ScrollFxOptions) {
  const tyreRef = useRef<TyreScene | null>(null);
  const carRef = useRef<CarScene | null>(null);
  const liveryRef = opts.liveryRef;

  // The compound colour is the one thing that crosses from React into WebGL,
  // and it is a single material write rather than a scene rebuild.
  useEffect(() => {
    tyreRef.current?.setCompoundColor(opts.compoundColor);
  }, [opts.compoundColor]);

  useEffect(() => {
    const r = root.current;
    if (!r) return;

    const q = <T extends HTMLElement>(s: string) => r.querySelector<T>(s);
    const qa = <T extends HTMLElement>(s: string) => Array.from(r.querySelectorAll<T>(s));

    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = matchMedia(POINTER_QUERY);
    /** Asked every frame — the setting can change while the page is open. */
    const calm = () => motionQuery.matches;
    const canPin = () => !calm() && innerWidth > PIN_MIN_WIDTH;

    // ── cursor ──────────────────────────────────────────────────────────────
    const usingCursor = CUSTOM_CURSOR && pointerQuery.matches;
    r.dataset.cursor = usingCursor ? "custom" : "native";
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...mouse };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const c = q("[data-cursor-ring]");
      if (!c) return;
      const t = e.target as Element | null;
      const hot = t?.closest?.("[data-hover],a,button");
      Object.assign(
        c.style,
        hot
          ? { width: "72px", height: "72px", margin: "-36px 0 0 -36px", background: "#fff" }
          : { width: "36px", height: "36px", margin: "-18px 0 0 -18px", background: "transparent" },
      );
    };
    if (usingCursor) {
      addEventListener("mousemove", onMove);
      addEventListener("mouseover", onOver);
    }

    // ── reveal ──────────────────────────────────────────────────────────────
    // Under reduced motion these are shown outright rather than observed: the
    // page must still be readable, and an element parked at opacity 0 waiting
    // on an observer is how a "no animation" setting turns into a blank page.
    const reveals = qa("[data-reveal]");
    let io: IntersectionObserver | null = null;
    if (calm()) {
      reveals.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    } else {
      reveals.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        el.style.transition =
          "opacity .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1), background .35s, padding .35s";
      });
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "none";
            io!.unobserve(e.target);
          }),
        { threshold: 0.12 },
      );
      reveals.forEach((el) => io!.observe(el));
    }

    // ── loader ──────────────────────────────────────────────────────────────
    const lines = qa("[data-line]");
    const intro = () =>
      lines.forEach((el, i) => {
        el.style.transition = `transform 1.2s cubic-bezier(.2,.8,.2,1) ${i * 0.09}s`;
        el.style.transform = "translateY(0)";
      });

    const loader = q("[data-loader]");
    let loaderRaf = 0;
    const timers: number[] = [];

    // The headline starts below its mask in every path, so the intro is the
    // only thing that reveals it — and every path has to reach the intro.
    lines.forEach((el) => (el.style.transform = "translateY(110%)"));

    if (!SHOW_LOADER || !loader || calm()) {
      if (loader) loader.style.display = "none";
      if (calm()) {
        lines.forEach((el) => (el.style.transform = "translateY(0)"));
      } else {
        requestAnimationFrame(() => requestAnimationFrame(intro));
      }
    } else {
      const lights = qa("[data-light]");
      const count = q("[data-count]");
      const bar = q("[data-lbar]");
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / LOADER_MS);
        if (count) count.textContent = String(Math.round(p * 100)).padStart(3, "0");
        if (bar) bar.style.width = `${p * 100}%`;
        lights.forEach((l, i) => {
          const on = p >= (i + 1) / 6;
          l.style.background = on ? "#e10600" : "#1d1d1d";
          l.style.boxShadow = on ? "0 0 40px rgba(225,6,0,.7)" : "inset 0 0 0 1px #2a2a2a";
        });
        if (p < 1) {
          loaderRaf = requestAnimationFrame(step);
          return;
        }
        // Lights out, then away we go — the pause is the whole gag.
        timers.push(
          window.setTimeout(() => {
            lights.forEach((l) => {
              l.style.background = "#1d1d1d";
              l.style.boxShadow = "none";
            });
            loader.style.transform = "translateY(-100%)";
            timers.push(window.setTimeout(intro, 350));
            timers.push(window.setTimeout(() => (loader.style.display = "none"), 1200));
          }, 420),
        );
      };
      loaderRaf = requestAnimationFrame(step);
    }

    // ── the two WebGL scenes ────────────────────────────────────────────────
    //
    // Loaded on demand, not with the page. Three is about 190kB gzipped —
    // nearly the whole bundle — and it is needed by two sections out of six.
    // Bundling it into the entry chunk would make the loader, the hero and
    // the marquee wait on a renderer none of them use. The design imported
    // it from a CDN for the same reason; this keeps the timing and drops the
    // third party.
    //
    // `cancelled` matters because these resolve after a fast unmount, and a
    // scene that builds itself into a detached node leaks a rAF loop.
    let cancelled = false;
    const carHost = q("[data-car-host]");
    if (carHost) {
      import("./three/car")
        .then(({ createCarScene }) => {
          if (cancelled) return;
          carRef.current = createCarScene(carHost, {
            anchors: HOTSPOTS.map((h) => h.anchor),
            getLivery: () => LIVERIES[liveryRef.current ?? 0] ?? LIVERIES[0]!,
          });
        })
        // A machine without WebGL still gets the whole page; it just does not
        // get the car. Failing loudly here would blank the section instead.
        .catch((e) => console.warn("car scene unavailable:", e instanceof Error ? e.message : e));
    }
    const tyreHost = q("[data-tyre-host]");
    if (tyreHost) {
      import("./three/tyre")
        .then(({ createTyreScene }) => {
          if (cancelled) return;
          tyreRef.current = createTyreScene(tyreHost, opts.compoundColor);
        })
        .catch((e) => console.warn("tyre scene unavailable:", e instanceof Error ? e.message : e));
    }

    // ── the frame ───────────────────────────────────────────────────────────
    let lastY = scrollY;
    let vel = 0;
    let machineSmooth: number | null = null;
    let raf = 0;

    /**
     * How far the viewport is through a section, 0–1.
     *
     * Pinned, that is how far the sticky child has travelled. Unpinned, the
     * section is an ordinary block, so it is how far the section has crossed
     * the viewport — which keeps the camera and the telemetry alive on a
     * phone without any scroll being taken over.
     */
    const through = (el: HTMLElement | null, pinned: boolean) => {
      if (!el) return 0;
      const b = el.getBoundingClientRect();
      if (pinned) {
        const span = b.height - innerHeight;
        return span <= 0 ? 0 : Math.min(1, Math.max(0, -b.top / span));
      }
      const span = innerHeight + b.height;
      return Math.min(1, Math.max(0, (innerHeight - b.top) / span));
    };

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const y = scrollY;
      const vh = innerHeight;
      const still = calm();
      const pinned = canPin();
      const k = still ? 0 : MOTION;

      r.dataset.pinned = pinned ? "on" : "off";

      vel = vel * 0.9 + (y - lastY) * 0.1;
      lastY = y;

      const docH = document.documentElement.scrollHeight - vh;
      const pb = q("[data-progress]");
      if (pb) pb.style.width = `${docH > 0 ? (y / docH) * 100 : 0}%`;

      // cursor
      if (usingCursor) {
        cur.x += (mouse.x - cur.x) * 0.18;
        cur.y += (mouse.y - cur.y) * 0.18;
        const ring = q("[data-cursor-ring]");
        const dot = q("[data-cursor-dot]");
        if (ring) ring.style.transform = `translate(${cur.x}px,${cur.y}px)`;
        if (dot) dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`;
        const pv = q("[data-preview]");
        if (pv) {
          pv.style.left = `${cur.x}px`;
          pv.style.top = `${cur.y}px`;
        }
      }

      // hero
      const hp = Math.min(1, y / vh);
      const heroImg = q("[data-hero-img]");
      if (heroImg) heroImg.style.transform = `translateY(${y * 0.35 * k}px) scale(${1.08 - hp * 0.08 + hp * 0.12})`;
      const heroTitle = q("[data-hero-title]");
      if (heroTitle) {
        heroTitle.style.transform = `translateY(${-y * 0.25 * k}px)`;
        heroTitle.style.opacity = String(still ? 1 : 1 - hp * 1.2);
      }

      // ── machine ───────────────────────────────────────────────────────────
      const machineRaw = through(q("[data-pin='machine']"), pinned);
      machineSmooth = machineSmooth == null ? machineRaw : machineSmooth + (machineRaw - machineSmooth) * 0.07;
      if (Math.abs(machineRaw - machineSmooth) < 0.0002) machineSmooth = machineRaw;
      const mp = machineSmooth;

      const car = carRef.current;
      if (car) {
        car.progress = mp;
        car.still = still;
      }

      const bg = q("[data-bgtext]");
      if (bg) bg.style.transform = `translate3d(${-mp * 60 * k}vw,-58%,0)`;

      // Hotspots follow the projected 3D anchors. They only exist while the
      // section is pinned — unpinned, the same four facts are a plain list
      // under the car, because a pin floating over a 340px-wide canvas with
      // a 230px card beside it is unreadable.
      const hotEls = qa("[data-hot]");
      const projected = car?.hotspots ?? null;
      hotEls.forEach((h, i) => {
        if (!pinned || !projected) {
          h.style.opacity = "0";
          return;
        }
        const t = Number(h.dataset.hot);
        const end = i === hotEls.length - 1 ? 0.83 : t + 0.13;
        const o =
          Math.min(1, Math.max(0, (mp - t) / 0.03)) * Math.min(1, Math.max(0, (end - mp) / 0.03));
        h.style.opacity = String(o);
        const p = projected[i];
        if (!p || o <= 0) return;
        h.style.left = `${p[0]}px`;
        h.style.top = `${p[1]}px`;

        // Keep the card on screen: flip it to whichever side has room, and
        // above or below depending on how close the pin is to an edge.
        const card = h.querySelector<HTMLElement>("[data-hot-card]");
        const boxEl = h.parentElement;
        if (!card || !boxEl) return;
        const W = boxEl.clientWidth;
        const H = boxEl.clientHeight;
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;
        const reserve = W > 720 ? 200 : 16;
        let cx = p[0] > (W - reserve) * 0.55 ? p[0] - cw - 18 : p[0] + 18;
        cx = Math.max(16, Math.min(W - reserve - cw, cx));
        card.style.left = `${cx - p[0]}px`;
        if (p[1] - ch - 22 < 150) {
          card.style.bottom = "auto";
          card.style.top = "22px";
        } else {
          card.style.top = "auto";
          card.style.bottom = "22px";
        }
        if (p[1] + ch + 22 > H - 130 && p[1] - ch - 22 < 150) {
          card.style.top = "auto";
          card.style.bottom = "22px";
        }
      });

      // telemetry
      const speedEl = q("[data-speed]");
      if (speedEl) speedEl.textContent = String(Math.round(easeOut(mp) * 352));
      const gearEl = q("[data-gear]");
      if (gearEl) gearEl.textContent = mp < 0.02 ? "N" : String(Math.min(8, 1 + Math.floor(mp * 8.2)));
      const rpmF = mp < 0.02 ? 0.27 : 0.45 + ((mp * 8.2) % 1) * 0.55;
      const rpmEl = q("[data-rpm]");
      if (rpmEl) rpmEl.textContent = Math.round(rpmF * 15000).toLocaleString("en").replace(",", " ");
      qa("[data-rpmbar]").forEach((b) => {
        const i = Number(b.dataset.rpmbar);
        const on = i / 15 < rpmF;
        b.style.background = on ? (i > 11 ? "#e10600" : i > 7 ? "#ffd12e" : "#edeae4") : "#1f1f1f";
      });

      // ── driver ────────────────────────────────────────────────────────────
      const dp = through(q("[data-pin='driver']"), pinned);
      const e2 = easeOut(Math.min(1, dp / 0.55));
      const helmet = q("[data-helmet]");
      if (helmet) {
        const inset = (v: number) => v * (1 - e2);
        helmet.style.clipPath = `inset(${inset(22)}% ${inset(32)}% ${inset(22)}% ${inset(32)}%)`;
      }
      const helmetImg = q("[data-helmet-img]");
      if (helmetImg) helmetImg.style.transform = `scale(${1.35 - e2 * 0.3 + dp * 0.05})`;
      const num = q("[data-num]");
      if (num) num.style.transform = `translateY(${(1 - dp) * 30 * k}vh)`;
      const copy = q("[data-driver-copy]");
      if (copy) {
        const on = still || dp > 0.5;
        copy.style.opacity = on ? "1" : "0";
        copy.style.transform = on ? "none" : "translateY(40px)";
      }

      // parallax images
      qa("[data-par]").forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        const b = parent.getBoundingClientRect();
        el.style.transform = `translateY(${(b.top + b.height / 2 - vh / 2) * -Number(el.dataset.par) * k}px)`;
      });

      const fw = q("[data-footer-word]");
      if (fw) {
        const b = fw.getBoundingClientRect();
        fw.style.transform = `translateY(${Math.max(0, b.top - vh * 0.6) * 0.3 * (still ? 0 : 1)}px)`;
      }

      // lap counter
      let lap = 1;
      qa("[data-sec]").forEach((s) => {
        if (s.getBoundingClientRect().top < vh * 0.5) lap = Number(s.dataset.sec);
      });
      const lapEl = q("[data-lap]");
      const text = String(Math.min(lap, TOTAL_LAPS)).padStart(2, "0");
      if (lapEl && lapEl.textContent !== text) lapEl.textContent = text;

      // The wheel keeps turning, faster when the page is moving.
      const tyre = tyreRef.current;
      if (tyre) {
        tyre.still = still;
        tyre.spin += still ? 0 : 0.012 + Math.min(0.25, Math.abs(vel) * 0.002);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(loaderRaf);
      timers.forEach(clearTimeout);
      removeEventListener("mousemove", onMove);
      removeEventListener("mouseover", onOver);
      io?.disconnect();
      carRef.current?.dispose();
      carRef.current = null;
      tyreRef.current?.dispose();
      tyreRef.current = null;
    };
    // Set up once. Everything that changes afterwards is read through a ref
    // or pushed by the small effect above — re-running this would rebuild
    // two WebGL scenes to change a colour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
