/**
 * The map, drawn with two primitives and no third party.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THERE IS NO TILE LAYER, NO MAP LIBRARY AND NO KEY.
 *
 * A slippy map would be the obvious reach, and it would put somebody else's
 * CDN in the critical path of the page's centrepiece, need an API key in a
 * public bundle, and ship two hundred kilobytes to draw twenty-five dots
 * and six lines.
 *
 * What is actually needed is a projection, and at city scale that is nine
 * lines of arithmetic. Across Nairobi — about 40 km of longitude — treating
 * the ground as flat and scaling longitude by cos(latitude) is wrong by a
 * few metres, against stop coordinates that are approximate to a block.
 * The error is three orders of magnitude under the data's own precision.
 *
 * Charter 03 §I: a dependency enters the stack when what is already there
 * cannot do the job. Arithmetic can do this job.
 * ══════════════════════════════════════════════════════════════════════════
 */

import { ROUTES, type Stop, STOPS, STOP_BY_ID } from "./network";
import { type Bunch, type Fix, geometryFor, routeOf } from "./sim";

export type Projection = {
  project: (lat: number, lon: number) => { x: number; y: number };
  /** Screen pixels per metre on the ground. For the scale bar. */
  pixelsPerMetre: number;
};

/**
 * A projection that puts every stop inside `width` × `height`.
 *
 * Equirectangular about the centre of the data, with the longitude axis
 * scaled by cos(centre latitude) so the city is not stretched sideways.
 */
export const fitProjection = (
  stops: Stop[],
  width: number,
  height: number,
  pad: number,
): Projection => {
  const lat0 = (Math.min(...stops.map((s) => s.lat)) + Math.max(...stops.map((s) => s.lat))) / 2;
  const lon0 = (Math.min(...stops.map((s) => s.lon)) + Math.max(...stops.map((s) => s.lon))) / 2;
  const kx = Math.cos((lat0 * Math.PI) / 180);

  const flat = stops.map((s) => ({ u: (s.lon - lon0) * kx, v: -(s.lat - lat0) }));
  const uMin = Math.min(...flat.map((p) => p.u));
  const uMax = Math.max(...flat.map((p) => p.u));
  const vMin = Math.min(...flat.map((p) => p.v));
  const vMax = Math.max(...flat.map((p) => p.v));

  // One scale for both axes, or the city arrives squashed.
  const scale = Math.min(
    (width - pad * 2) / (uMax - uMin || 1),
    (height - pad * 2) / (vMax - vMin || 1),
  );

  const offsetX = (width - (uMax - uMin) * scale) / 2 - uMin * scale;
  const offsetY = (height - (vMax - vMin) * scale) / 2 - vMin * scale;

  return {
    project: (lat, lon) => ({
      x: (lon - lon0) * kx * scale + offsetX,
      y: -(lat - lat0) * scale + offsetY,
    }),
    // One degree of latitude is 111_320 m, near enough anywhere.
    pixelsPerMetre: scale / 111_320,
  };
};

// ── Colour ───────────────────────────────────────────────────────────────

export type Palette = {
  bg: string;
  rule: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  warn: string;
};

/**
 * The canvas asks the stylesheet what colour things are.
 *
 * ⚠ A CANVAS CANNOT READ A CUSTOM PROPERTY. `ctx.strokeStyle` takes a
 *   colour, and `var(--ink)` is not one — it resolves against an element,
 *   and the canvas bitmap is not an element.
 *
 * So the tokens are read once off the host node and passed in. Everything
 * below names a field of this object and never a literal, which is what
 * keeps the drawing in the same theme as the page around it. Read again
 * whenever the theme changes; `useTheme` in App.tsx owns that.
 */
export const readPalette = (el: HTMLElement): Palette => {
  const s = getComputedStyle(el);
  const get = (name: string) => s.getPropertyValue(name).trim();
  return {
    bg: get("--bg-sunken"),
    rule: get("--rule"),
    ink: get("--ink"),
    inkMuted: get("--ink-muted"),
    inkFaint: get("--ink-faint"),
    warn: get("--warn"),
  };
};

const routeColour = (hue: number, lightness: number, alpha = 1) =>
  `hsl(${hue} 58% ${lightness}% / ${alpha})`;

// ── The drawing ──────────────────────────────────────────────────────────

export type Scene = {
  projection: Projection;
  palette: Palette;
  fixes: Fix[];
  bunches: Bunch[];
  selectedStopId: string;
  /** Null shows every route. */
  focusRouteId: string | null;
  /** Dark themes want lighter route lines than light ones. */
  dark: boolean;
};

export const draw = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: Scene,
) => {
  const { projection: p, palette, dark } = scene;
  const line = dark ? 62 : 44;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const dim = (routeId: string) =>
    scene.focusRouteId !== null && scene.focusRouteId !== routeId;

  // ── Corridors ──────────────────────────────────────────────────────────
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const route of ROUTES) {
    const geo = geometryFor(route, "out");
    ctx.beginPath();
    geo.stops.forEach((stop, i) => {
      const { x, y } = p.project(stop.lat, stop.lon);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = routeColour(route.hue, line, dim(route.id) ? 0.14 : 0.85);
    ctx.lineWidth = dim(route.id) ? 2 : 3.5;
    ctx.stroke();
  }

  // ── Stops ──────────────────────────────────────────────────────────────
  for (const stop of STOPS) {
    const { x, y } = p.project(stop.lat, stop.lon);
    const selected = stop.id === scene.selectedStopId;
    const r = stop.kind === "terminus" ? 5 : stop.kind === "stage" ? 4 : 3;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = palette.bg;
    ctx.fill();
    ctx.strokeStyle = selected ? palette.ink : palette.inkFaint;
    ctx.lineWidth = selected ? 2.5 : 1.5;
    ctx.stroke();

    if (selected) {
      ctx.beginPath();
      ctx.arc(x, y, r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Only termini and the selected stop are labelled. Labelling all
    // twenty-five produces a drawing where the words overlap and none of
    // them can be read, which is worse than a map with no words on it.
    if (stop.kind === "terminus" || selected) {
      ctx.font = `${selected ? 600 : 500} 11px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillStyle = selected ? palette.ink : palette.inkMuted;
      ctx.textBaseline = "middle";
      const right = x < width * 0.62;
      ctx.textAlign = right ? "left" : "right";
      ctx.fillText(stop.name, x + (right ? 10 : -10), y);
    }
  }

  // ── Vehicles ───────────────────────────────────────────────────────────
  const bunched = new Set(scene.bunches.flatMap((b) => b.ids));

  for (const fix of scene.fixes) {
    if (fix.arrived) continue;
    const route = routeOf(fix.vehicle);
    if (dim(route.id)) continue;

    const { x, y } = p.project(fix.lat, fix.lon);
    const geo = geometryFor(route, fix.vehicle.direction);
    const ahead = geo.stops[Math.min(fix.nextStopIndex, geo.stops.length - 1)];
    const target = p.project(ahead.lat, ahead.lon);
    const angle = Math.atan2(target.y - y, target.x - x);

    if (bunched.has(fix.vehicle.id)) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fillStyle = palette.warn;
      ctx.globalAlpha = 0.22;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // A triangle rather than a dot, because direction is half the
    // information: two vehicles at the same point going opposite ways are a
    // normal morning, and two going the same way are the thing to look at.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, 3.6);
    ctx.lineTo(-4, -3.6);
    ctx.closePath();
    ctx.fillStyle = routeColour(route.hue, dark ? 68 : 42);
    ctx.fill();
    ctx.strokeStyle = palette.bg;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  drawScaleBar(ctx, width, height, p, palette);
};

const drawScaleBar = (
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number,
  p: Projection,
  palette: Palette,
) => {
  // Pick the roundest distance that draws between 60 and 140 pixels, so the
  // bar says "5 km" rather than "4.7 km".
  const candidates = [500, 1000, 2000, 5000, 10_000, 20_000];
  const metres = candidates.find((m) => m * p.pixelsPerMetre > 60) ?? 20_000;
  const px = metres * p.pixelsPerMetre;
  const x = 16;
  const y = height - 18;

  ctx.strokeStyle = palette.inkFaint;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y);
  ctx.lineTo(x + px, y);
  ctx.lineTo(x + px, y - 4);
  ctx.stroke();

  ctx.font = "500 10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = palette.inkFaint;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(metres >= 1000 ? `${metres / 1000} km` : `${metres} m`, x, y - 6);
};

/** The stop nearest a click, if the click was close enough to mean one. */
export const stopNear = (
  p: Projection,
  x: number,
  y: number,
  within = 18,
): Stop | null => {
  let best: Stop | null = null;
  let bestD = within;
  for (const stop of STOPS) {
    const q = p.project(stop.lat, stop.lon);
    const d = Math.hypot(q.x - x, q.y - y);
    if (d < bestD) {
      bestD = d;
      best = stop;
    }
  }
  return best;
};

export const stopName = (id: string): string => STOP_BY_ID.get(id)?.name ?? id;
