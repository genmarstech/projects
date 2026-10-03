import { useEffect, useRef } from "react";

import { type Cell } from "./exec";
import { type Chartable, drawBars } from "./chart";

export const Chart = ({
  columns,
  rows,
  pick,
}: {
  columns: string[];
  rows: Cell[][];
  pick: Chartable;
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const paint = () => drawBars(canvas, host, columns, rows, pick);
    paint();

    // A canvas does not reflow. Without this the bars keep the width the
    // panel had when the query returned, and a window resize smears them.
    const ro = new ResizeObserver(paint);
    ro.observe(host);

    // And it does not re-read the stylesheet either, so a theme change
    // leaves one theme's ink on the other's ground until something else
    // happens to repaint.
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", paint);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", paint);
    };
  }, [columns, rows, pick]);

  return (
    <div className="chart" ref={hostRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${pick.value} by ${pick.label}, for ${rows.length} rows. The same figures are in the table below.`}
      />
    </div>
  );
};
