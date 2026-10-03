/**
 * A bar chart, drawn from whatever the result happens to be.
 *
 * ── THE CHART IS OFFERED, NOT ASSUMED ────────────────────────────────────
 *
 * A result is chartable when it has one text column to label bars with and
 * at least one numeric column to size them. `chartable()` decides, and when
 * it says no the canvas is not rendered at all — rather than a chart of
 * row numbers against row numbers, which is what a charting library
 * produces when handed a table it cannot read.
 *
 * ⚠ THE CANVAS READS THE THEME TOKENS OFF A HOST ELEMENT. `ctx.fillStyle`
 *   takes a colour and `var(--ink)` is not one: a custom property resolves
 *   against an element, and a canvas bitmap is not an element.
 */

import { type Cell } from "./exec";
import { fmt } from "./columnar";

export type Chartable = { labelAt: number; valueAt: number; label: string; value: string };

export const chartable = (columns: string[], rows: Cell[][]): Chartable | null => {
  if (rows.length === 0 || rows.length > 40) return null;

  const labelAt = columns.findIndex((_, i) => rows.every((r) => typeof r[i] === "string"));
  if (labelAt < 0) return null;

  const valueAt = columns.findIndex(
    (_, i) => i !== labelAt && rows.every((r) => typeof r[i] === "number"),
  );
  if (valueAt < 0) return null;

  return { labelAt, valueAt, label: columns[labelAt], value: columns[valueAt] };
};

export const drawBars = (
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  columns: string[],
  rows: Cell[][],
  pick: Chartable,
) => {
  const style = getComputedStyle(host);
  const token = (name: string) => style.getPropertyValue(name).trim();

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const ink = token("--ink");
  const faint = token("--ink-faint");
  const rule = token("--rule");
  const accent = token("--accent");

  const padLeft = 150;
  const padRight = 70;
  const padTop = 8;
  const gap = 4;

  const values = rows.map((r) => Number(r[pick.valueAt]) || 0);
  const peak = Math.max(...values, 1);
  const barH = Math.max(
    10,
    Math.min(26, (height - padTop * 2 - gap * (rows.length - 1)) / rows.length),
  );

  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  rows.forEach((row, i) => {
    const y = padTop + i * (barH + gap);
    if (y + barH > height) return;

    const w = ((width - padLeft - padRight) * values[i]) / peak;

    ctx.fillStyle = rule;
    ctx.fillRect(padLeft, y, width - padLeft - padRight, barH);

    ctx.fillStyle = accent;
    ctx.fillRect(padLeft, y, Math.max(1, w), barH);

    ctx.fillStyle = faint;
    ctx.textAlign = "right";
    // Labels are clipped to the gutter rather than allowed to run under
    // the bars. A long branch name overlapping its own bar is worse than
    // a truncated one.
    const label = String(row[pick.labelAt] ?? "");
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, padLeft - 10, barH);
    ctx.clip();
    ctx.fillText(label, padLeft - 10, y + barH / 2);
    ctx.restore();

    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    ctx.fillText(fmt(values[i]), padLeft + Math.max(1, w) + 8, y + barH / 2);
  });

  void columns;
};
