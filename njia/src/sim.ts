/**
 * One morning on six corridors, generated from a number.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * NOTHING ACCUMULATES. EVERY ANSWER IS A FUNCTION OF THE CLOCK.
 *
 * A vehicle's position is integrated from its departure every time it is
 * asked for, rather than advanced one tick at a time and stored. That costs
 * a few thousand multiplications a second and buys the only property that
 * makes the thing arguable: scrubbing the clock back to 07:14 shows exactly
 * what 07:14 showed, whether you arrived there by playing forwards, by
 * dragging backwards, or by reloading the page.
 *
 * A simulation whose history depends on how you got there cannot be used to
 * demonstrate anything. The same rule is why `seededSchedule` takes a seed:
 * two people looking at this are looking at the same morning.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ THERE IS NO FEED BEHIND THIS. See the banner in `network.ts`. Every
 *   figure on the screen is generated here, in the browser, from a seed.
 */

import {
  ROUTES,
  type Route,
  type Stop,
  cumulativeMetres,
  routeStops,
} from "./network";

/** The day starts and ends; outside this the corridors are empty. */
export const SERVICE_START = 5 * 60 + 30;
export const SERVICE_END = 22 * 60;

/** Away from the centre, and back towards it. Index 0 of a route is in town. */
export type Direction = "out" | "in";

export type Vehicle = {
  id: string;
  routeId: string;
  direction: Direction;
  /** Minutes since midnight. */
  departedAt: number;
  /**
   * How this particular matatu drives, as a multiplier on the corridor's
   * speed. Drawn once from the seed and kept, because a vehicle that was
   * quick in the first segment is usually quick in the next one — resampling
   * it each step would average every vehicle back to the same speed and
   * nothing would ever bunch.
   */
  pace: number;
  /** Painted on the side. Invented, and formatted like a Kenyan plate. */
  plate: string;
};

/** Where a vehicle is, right now. */
export type Fix = {
  vehicle: Vehicle;
  /** Metres travelled along its route, in its direction. */
  metres: number;
  lat: number;
  lon: number;
  /** Index of the stop it is heading for, in direction order. */
  nextStopIndex: number;
  /** Finished its run and is out of service until it turns round. */
  arrived: boolean;
};

export type Arrival = {
  vehicle: Vehicle;
  route: Route;
  /** Minutes from now. */
  eta: number;
  /**
   * Half-width of the honest range, in minutes.
   *
   * An arrival board that prints a single number for a vehicle forty minutes
   * away is claiming a precision no model has. This grows with the distance
   * still to cover and with how congested that stretch is.
   */
  slack: number;
  /** Where it is now, in words. */
  from: string;
  bunchedWith?: string;
};

// ── The seed ─────────────────────────────────────────────────────────────

/** mulberry32. Thirty-two bits of state, which is all a demo needs. */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const PLATE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXY";

/**
 * How much slower than free-flow the corridor is at this minute.
 *
 * Morning peak loads the inbound direction and evening peak the outbound
 * one, which is the whole reason direction is a parameter: a board that
 * applied one congestion curve to both would show the empty direction
 * running as late as the full one.
 */
export const congestion = (minute: number, direction: Direction): number => {
  const peak = (centre: number, width: number, height: number) =>
    height * Math.exp(-(((minute - centre) / width) ** 2));

  const morning = peak(7 * 60 + 45, 75, direction === "in" ? 1.25 : 0.35);
  const evening = peak(17 * 60 + 45, 85, direction === "out" ? 1.15 : 0.4);
  const lunch = peak(13 * 60, 45, 0.18);

  return 1 + morning + evening + lunch;
};

/** Seconds a vehicle stands at a stop of this kind. */
const dwellSeconds = (stop: Stop): number =>
  stop.kind === "terminus" ? 0 : stop.kind === "stage" ? 50 : 20;

// ── The timetable ────────────────────────────────────────────────────────

/**
 * Every departure of the day, both directions, all six routes.
 *
 * Built once per seed rather than per frame. It is the only thing in this
 * module that is stored, and it is stored because it is the input, not a
 * result: the positions below are all derived from it and the clock.
 */
export const seededSchedule = (seed: number): Vehicle[] => {
  const next = rng(seed);
  const out: Vehicle[] = [];

  for (const route of ROUTES) {
    for (const direction of ["out", "in"] as Direction[]) {
      let at = SERVICE_START + next() * route.plannedHeadway;
      let n = 0;

      while (at < SERVICE_END) {
        // Headway is a target, not a contract. A sacco dispatching every six
        // minutes on paper dispatches somewhere between four and nine, and
        // that spread is where bunching comes from — not from the traffic.
        const jitter = (next() - 0.5) * route.plannedHeadway * 0.45;
        out.push({
          id: `${route.id}-${direction}-${n}`,
          routeId: route.id,
          direction,
          departedAt: at,
          pace: 0.91 + next() * 0.17,
          plate: `K${PLATE_LETTERS[Math.floor(next() * PLATE_LETTERS.length)]}${
            PLATE_LETTERS[Math.floor(next() * PLATE_LETTERS.length)]
          } ${String(Math.floor(next() * 900) + 100)}${
            PLATE_LETTERS[Math.floor(next() * PLATE_LETTERS.length)]
          }`,
        });

        // Floored at just over half the planned headway. A sacco that
        // dispatched two vehicles ninety seconds apart would have made the
        // bunch in the yard, and this file is about bunches the road makes.
        at += Math.max(route.plannedHeadway * 0.55, route.plannedHeadway + jitter);
        n += 1;
      }
    }
  }

  return out;
};

// ── Geometry, cached per route ───────────────────────────────────────────

type Geometry = { stops: Stop[]; cum: number[]; total: number };

const GEOMETRY = new Map<string, Record<Direction, Geometry>>();

export const geometryFor = (route: Route, direction: Direction): Geometry => {
  let both = GEOMETRY.get(route.id);
  if (!both) {
    const forward = routeStops(route);
    const backward = [...forward].reverse();
    both = {
      out: { stops: forward, cum: cumulativeMetres(forward), total: 0 },
      in: { stops: backward, cum: cumulativeMetres(backward), total: 0 },
    };
    both.out.total = both.out.cum[both.out.cum.length - 1];
    both.in.total = both.in.cum[both.in.cum.length - 1];
    GEOMETRY.set(route.id, both);
  }
  return both[direction];
};

const ROUTE_BY_ID = new Map(ROUTES.map((r) => [r.id, r]));

export const routeOf = (vehicle: Vehicle): Route => {
  const route = ROUTE_BY_ID.get(vehicle.routeId);
  if (!route) throw new Error(`No route ${vehicle.routeId}`);
  return route;
};

// ── Integration ──────────────────────────────────────────────────────────

/** Half a minute. Fine enough that the answer stops changing when halved. */
const STEP = 0.5;

/**
 * Metres covered by `vehicle` between its departure and `minute`.
 *
 * Walked forwards from the departure every call. See this file's banner for
 * why that is not an oversight.
 */
const metresAt = (vehicle: Vehicle, minute: number): { metres: number; index: number } => {
  const route = routeOf(vehicle);
  const geo = geometryFor(route, vehicle.direction);
  const freeFlow = geo.total / route.runMinutes; // metres per minute

  let t = vehicle.departedAt;
  let metres = 0;
  let index = 1;

  while (t < minute && metres < geo.total) {
    // Dwell is consumed at the stop, before any of the next segment is.
    while (index < geo.cum.length && metres >= geo.cum[index]) {
      t += dwellSeconds(geo.stops[index]) / 60;
      index += 1;
      if (t >= minute) return { metres, index: Math.min(index, geo.cum.length - 1) };
    }
    metres += ((freeFlow * vehicle.pace) / congestion(t, vehicle.direction)) * STEP;
    t += STEP;
  }

  if (metres >= geo.total) return { metres: geo.total, index: geo.cum.length - 1 };
  return { metres, index: Math.min(index, geo.cum.length - 1) };
};

/** Interpolate a coordinate from a distance along the route. */
const pointAt = (geo: Geometry, metres: number): { lat: number; lon: number } => {
  for (let i = 1; i < geo.cum.length; i += 1) {
    if (metres <= geo.cum[i]) {
      const span = geo.cum[i] - geo.cum[i - 1] || 1;
      const f = (metres - geo.cum[i - 1]) / span;
      const a = geo.stops[i - 1];
      const b = geo.stops[i];
      return { lat: a.lat + (b.lat - a.lat) * f, lon: a.lon + (b.lon - a.lon) * f };
    }
  }
  const last = geo.stops[geo.stops.length - 1];
  return { lat: last.lat, lon: last.lon };
};

/** Every vehicle that is on the road at `minute`. */
export const fixesAt = (schedule: Vehicle[], minute: number): Fix[] => {
  const out: Fix[] = [];

  for (const vehicle of schedule) {
    if (vehicle.departedAt > minute) continue;
    // Nothing is tracked for longer than it could plausibly still be running.
    if (minute - vehicle.departedAt > routeOf(vehicle).runMinutes * 2.6) continue;

    const geo = geometryFor(routeOf(vehicle), vehicle.direction);
    const { metres, index } = metresAt(vehicle, minute);
    const { lat, lon } = pointAt(geo, metres);

    out.push({
      vehicle,
      metres,
      lat,
      lon,
      nextStopIndex: index,
      arrived: metres >= geo.total - 1,
    });
  }

  return out;
};

// ── The board ────────────────────────────────────────────────────────────

/**
 * Minutes for a vehicle at `metres` to reach `target` metres, from `minute`.
 *
 * Integrated forwards the same way the position was integrated to get here,
 * with the same congestion curve — so an ETA issued at 07:10 for 07:40
 * already knows the corridor is about to get worse. A board that assumed
 * current speed would hold is the one that tells you four minutes at the
 * exact moment four minutes stops being true.
 */
const minutesTo = (
  vehicle: Vehicle,
  fromMetres: number,
  toMetres: number,
  minute: number,
): number => {
  const route = routeOf(vehicle);
  const geo = geometryFor(route, vehicle.direction);
  const freeFlow = geo.total / route.runMinutes;

  let t = minute;
  let metres = fromMetres;
  let index = geo.cum.findIndex((c) => c > fromMetres);
  if (index < 0) index = geo.cum.length - 1;

  while (metres < toMetres && t - minute < 180) {
    while (index < geo.cum.length && metres >= geo.cum[index]) {
      if (geo.cum[index] <= toMetres) t += dwellSeconds(geo.stops[index]) / 60;
      index += 1;
    }
    metres += ((freeFlow * vehicle.pace) / congestion(t, vehicle.direction)) * STEP;
    t += STEP;
  }

  return t - minute;
};

/**
 * The next arrivals at one stop, soonest first.
 *
 * A vehicle appears here only if the stop is still ahead of it. There is no
 * "just left" row: a board that lists a matatu you cannot catch is a board
 * people learn to read past.
 */
export const arrivalsAt = (
  fixes: Fix[],
  stopId: string,
  minute: number,
  limit = 8,
): Arrival[] => {
  const out: Arrival[] = [];

  for (const fix of fixes) {
    if (fix.arrived) continue;
    const route = routeOf(fix.vehicle);
    const geo = geometryFor(route, fix.vehicle.direction);
    const at = geo.stops.findIndex((s) => s.id === stopId);
    if (at <= 0) continue; // not on this route, or it is where the run begins

    const target = geo.cum[at];
    if (fix.metres >= target) continue;

    const eta = minutesTo(fix.vehicle, fix.metres, target, minute);
    const remaining = target - fix.metres;

    // Slack grows with what is left to cover and with how much of that is
    // peak. Ten per cent of the journey ahead, floored at half a minute so
    // a vehicle pulling in still reads as an estimate, capped so a long ETA
    // says "about" rather than becoming meaningless.
    const slack = Math.min(9, Math.max(0.5, (remaining / 1000) * 0.9 * congestion(minute, fix.vehicle.direction)));

    out.push({
      vehicle: fix.vehicle,
      route,
      eta,
      slack,
      from: geo.stops[Math.max(0, fix.nextStopIndex - 1)].name,
    });
  }

  out.sort((a, b) => a.eta - b.eta);
  return out.slice(0, limit);
};

// ── Bunching ─────────────────────────────────────────────────────────────

export type Bunch = {
  routeId: string;
  direction: Direction;
  /** Vehicle ids, in order along the road. */
  ids: string[];
  /** Minutes between the leader and the one behind it. */
  gap: number;
};

/**
 * Pairs of vehicles that have closed up on each other.
 *
 * ── WHY THIS IS THE INTERESTING NUMBER AND THE HEADWAY IS NOT ─────────────
 *
 * Bunching is self-reinforcing and it is the ordinary failure of a
 * high-frequency route. The vehicle in front picks up everybody waiting, so
 * it dwells longer and falls further behind; the one behind arrives at empty
 * stops, sails through and catches it. From the kerb this looks like a
 * twenty-minute wait followed by three matatus at once, on a route the
 * operator will correctly tell you runs every six minutes.
 *
 * So the average headway stays honest while the service people actually get
 * falls apart, which is why this is computed from live gaps rather than
 * from the timetable. A pair is bunched when the gap has fallen under 40%
 * of the planned headway.
 */
export const bunchesIn = (fixes: Fix[], minute: number): Bunch[] => {
  const groups = new Map<string, Fix[]>();

  for (const fix of fixes) {
    if (fix.arrived) continue;
    // Vehicles still inside the terminus are queuing, not bunched. Counting
    // the rank as a bunch would report one on every route all day and the
    // panel would stop meaning anything.
    if (fix.metres < 600) continue;
    const key = `${fix.vehicle.routeId}:${fix.vehicle.direction}`;
    const list = groups.get(key);
    if (list) list.push(fix);
    else groups.set(key, [fix]);
  }

  const out: Bunch[] = [];

  for (const [key, list] of groups) {
    const [routeId, direction] = key.split(":") as [string, Direction];
    const route = ROUTE_BY_ID.get(routeId);
    if (!route) continue;

    list.sort((a, b) => b.metres - a.metres); // leader first

    for (let i = 1; i < list.length; i += 1) {
      const leader = list[i - 1];
      const follower = list[i];
      const gap = minutesTo(follower.vehicle, follower.metres, leader.metres, minute);

      if (gap < route.plannedHeadway * 0.4) {
        const last = out[out.length - 1];
        // A third vehicle joining an existing bunch extends it rather than
        // opening a second one — three in a row is one event on the road.
        if (last && last.routeId === routeId && last.direction === direction && last.ids[last.ids.length - 1] === leader.vehicle.id) {
          last.ids.push(follower.vehicle.id);
          last.gap = Math.min(last.gap, gap);
        } else {
          out.push({ routeId, direction, ids: [leader.vehicle.id, follower.vehicle.id], gap });
        }
      }
    }
  }

  return out.sort((a, b) => a.gap - b.gap);
};

export const clockLabel = (minute: number): string => {
  const m = ((Math.floor(minute) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
