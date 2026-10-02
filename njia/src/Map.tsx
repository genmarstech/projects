import { useEffect, useMemo, useRef, useState } from "react";

import { STOPS, STOP_BY_ID } from "./network";
import { type Bunch, type Fix } from "./sim";
import { draw, fitProjection, readPalette, stopNear } from "./paint";

type Props = {
  fixes: Fix[];
  bunches: Bunch[];
  selectedStopId: string;
  focusRouteId: string | null;
  dark: boolean;
  onSelectStop: (id: string) => void;
};

/**
 * The canvas, and the four things a canvas always needs and usually lacks.
 *
 * 1. A device-pixel-ratio-aware backing store, or every line is soft.
 * 2. A ResizeObserver, because a canvas does not reflow — it stretches the
 *    bitmap it has, and a window resize turns the drawing into a smear.
 * 3. A palette re-read when the theme flips. See `readPalette`.
 * 4. An accessible equivalent. This one has `role="img"` and a sentence,
 *    and the board beside it carries the same information as text — which
 *    is the actual answer, because a one-line summary of a moving map is
 *    not a substitute for it.
 */
export const Map = ({
  fixes,
  bunches,
  selectedStopId,
  focusRouteId,
  dark,
  onSelectStop,
}: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ro = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setSize({ w: Math.round(box.width), h: Math.round(box.height) });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const projection = useMemo(
    () => (size.w > 0 ? fitProjection(STOPS, size.w, size.h, 56) : null),
    [size.w, size.h],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host || !projection || size.w === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(ctx, size.w, size.h, {
      projection,
      palette: readPalette(host),
      fixes,
      bunches,
      selectedStopId,
      focusRouteId,
      dark,
    });
  }, [projection, size, fixes, bunches, selectedStopId, focusRouteId, dark]);

  const moving = fixes.filter((f) => !f.arrived).length;
  const selected = STOP_BY_ID.get(selectedStopId);

  return (
    <div className="map" ref={hostRef}>
      <canvas
        ref={canvasRef}
        className="map__canvas"
        role="img"
        aria-label={`Six corridors across Nairobi with ${moving} matatus running. ${selected?.name ?? ""} is selected; its arrivals are listed in the board beside this map.`}
        onClick={(event) => {
          if (!projection) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const hit = stopNear(projection, event.clientX - rect.left, event.clientY - rect.top);
          if (hit) onSelectStop(hit.id);
        }}
      />
    </div>
  );
};
