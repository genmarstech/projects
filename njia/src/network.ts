/**
 * Six Nairobi corridors, as a graph of stops.
 *
 * ── WHAT IS REAL HERE AND WHAT IS NOT ──────────────────────────────────────
 *
 * The places are real and the corridors are real: these are routes people
 * queue for every morning. The coordinates are approximate, read off public
 * landmarks to within a block or so, which is all a city-scale drawing needs.
 *
 * ⚠ EVERY VEHICLE, TIME AND HEADWAY IN THIS APPLICATION IS SIMULATED.
 *
 *   No operator supplied data, none was scraped, and there is no feed behind
 *   this. `sim.ts` generates the whole morning from a seed. A board that
 *   looked like this and was wrong would be worse than no board, so it says
 *   so on the screen as well as here.
 *
 * ── WHY A STOP LIST AND NOT A POLYLINE ─────────────────────────────────────
 *
 * A drawn route would need the road geometry, which means somebody's map
 * data and somebody's licence. Straight runs between stops are honest about
 * what is known: the stops are where the diagram says, and the line between
 * them is a connection rather than a claim about which street it takes.
 */

export type Stop = {
  id: string;
  name: string;
  /** Degrees. Approximate — see the banner. */
  lat: number;
  lon: number;
  /** Shown on the board; a terminus reads differently from a kerbside stop. */
  kind: "terminus" | "stage" | "stop";
};

export type Route = {
  id: string;
  /** The number painted on the matatu. */
  number: string;
  name: string;
  /** Ordered, outbound. Inbound is this list reversed. */
  stops: string[];
  /** Minutes a full outbound run takes in free-flowing traffic. */
  runMinutes: number;
  /** Minutes between departures the operator aims for. */
  plannedHeadway: number;
  /** Hue used for this route everywhere — board, map, legend. */
  hue: number;
};

export const STOPS: Stop[] = [
  // ── The centre ──────────────────────────────────────────────────────────
  { id: "railways", name: "Railways", lat: -1.2884, lon: 36.827, kind: "terminus" },
  { id: "kencom", name: "Kencom", lat: -1.286, lon: 36.8238, kind: "terminus" },
  { id: "muthurwa", name: "Muthurwa", lat: -1.291, lon: 36.837, kind: "terminus" },

  // ── 46 · Ngong Road and west ────────────────────────────────────────────
  { id: "kenyatta-ave", name: "Kenyatta Avenue", lat: -1.2845, lon: 36.8185, kind: "stop" },
  { id: "nairobi-hospital", name: "Nairobi Hospital", lat: -1.2955, lon: 36.8045, kind: "stop" },
  { id: "adams", name: "Adams Arcade", lat: -1.301, lon: 36.779, kind: "stage" },
  { id: "dagoretti-corner", name: "Dagoretti Corner", lat: -1.3, lon: 36.756, kind: "stage" },
  { id: "kawangware", name: "Kawangware 46", lat: -1.284, lon: 36.743, kind: "terminus" },

  // ── 111 · Ngong Road out to Ngong town ──────────────────────────────────
  { id: "junction", name: "The Junction", lat: -1.2985, lon: 36.7662, kind: "stop" },
  { id: "karen", name: "Karen", lat: -1.319, lon: 36.712, kind: "stage" },
  { id: "ngong", name: "Ngong Town", lat: -1.359, lon: 36.656, kind: "terminus" },

  // ── 23 · Thika Road ─────────────────────────────────────────────────────
  { id: "muthaiga", name: "Muthaiga", lat: -1.256, lon: 36.836, kind: "stop" },
  { id: "allsops", name: "Allsops", lat: -1.246, lon: 36.853, kind: "stage" },
  { id: "roasters", name: "Roasters", lat: -1.234, lon: 36.868, kind: "stage" },
  { id: "githurai", name: "Githurai 45", lat: -1.207, lon: 36.915, kind: "stage" },
  { id: "kahawa-west", name: "Kahawa West", lat: -1.188, lon: 36.918, kind: "terminus" },

  // ── 58 · Jogoo Road ─────────────────────────────────────────────────────
  { id: "city-stadium", name: "City Stadium", lat: -1.295, lon: 36.845, kind: "stop" },
  { id: "buruburu", name: "Buruburu", lat: -1.286, lon: 36.875, kind: "stage" },
  { id: "donholm", name: "Donholm", lat: -1.296, lon: 36.888, kind: "terminus" },

  // ── 125 · Langata Road ──────────────────────────────────────────────────
  { id: "nyayo", name: "Nyayo Stadium", lat: -1.3045, lon: 36.829, kind: "stop" },
  { id: "wilson", name: "Wilson Airport", lat: -1.322, lon: 36.815, kind: "stop" },
  { id: "bomas", name: "Bomas", lat: -1.346, lon: 36.764, kind: "stage" },
  { id: "rongai", name: "Ongata Rongai", lat: -1.396, lon: 36.743, kind: "terminus" },

  // ── 33 · Outering ───────────────────────────────────────────────────────
  { id: "pipeline", name: "Pipeline", lat: -1.31, lon: 36.893, kind: "stage" },
  { id: "embakasi", name: "Embakasi", lat: -1.322, lon: 36.894, kind: "terminus" },
];

export const ROUTES: Route[] = [
  {
    id: "r46",
    number: "46",
    name: "Kawangware — Railways",
    stops: ["railways", "kenyatta-ave", "nairobi-hospital", "adams", "dagoretti-corner", "kawangware"],
    runMinutes: 38,
    plannedHeadway: 6,
    hue: 18,
  },
  {
    id: "r111",
    number: "111",
    name: "Ngong — Railways",
    stops: ["railways", "kenyatta-ave", "nairobi-hospital", "adams", "junction", "karen", "ngong"],
    runMinutes: 62,
    plannedHeadway: 12,
    hue: 268,
  },
  {
    id: "r23",
    number: "23",
    name: "Kahawa West — Kencom",
    stops: ["kencom", "muthaiga", "allsops", "roasters", "githurai", "kahawa-west"],
    runMinutes: 55,
    plannedHeadway: 7,
    hue: 196,
  },
  {
    id: "r58",
    number: "58",
    name: "Donholm — Muthurwa",
    stops: ["muthurwa", "city-stadium", "buruburu", "donholm"],
    runMinutes: 32,
    plannedHeadway: 5,
    hue: 150,
  },
  {
    id: "r125",
    number: "125",
    name: "Rongai — Railways",
    stops: ["railways", "nyayo", "wilson", "bomas", "rongai"],
    runMinutes: 58,
    plannedHeadway: 9,
    hue: 36,
  },
  {
    id: "r33",
    number: "33",
    name: "Embakasi — Muthurwa",
    stops: ["muthurwa", "city-stadium", "buruburu", "pipeline", "embakasi"],
    runMinutes: 44,
    plannedHeadway: 8,
    hue: 330,
  },
];

export const STOP_BY_ID = new Map(STOPS.map((s) => [s.id, s]));

export const routeStops = (route: Route): Stop[] =>
  route.stops.map((id) => {
    const stop = STOP_BY_ID.get(id);
    // A route naming a stop that does not exist is a typo in the file above,
    // and it should stop the build rather than render a route with a hole.
    if (!stop) throw new Error(`Route ${route.number} names unknown stop "${id}"`);
    return stop;
  });

/**
 * Metres between two coordinates, by the haversine formula.
 *
 * Used only to apportion a route's run time across its segments, so a
 * vehicle crawls through town and opens up on Thika Road rather than moving
 * at one speed between every pair of stops.
 */
export const metresBetween = (a: Stop, b: Stop): number => {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Cumulative metres from the first stop to each stop on the route. */
export const cumulativeMetres = (stops: Stop[]): number[] => {
  const out = [0];
  for (let i = 1; i < stops.length; i += 1) {
    out.push(out[i - 1] + metresBetween(stops[i - 1], stops[i]));
  }
  return out;
};
