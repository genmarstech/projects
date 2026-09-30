/** A tyre compound and the trade-off it represents. */
export interface Compound {
  name: string;
  /** The stripe colour on the sidewall, and the bar colour in the stats. */
  color: string;
  /** 0–100. Drives both the stat bar and the copy. */
  grip: number;
  life: number;
  /** Free text — a range, not a number, so it is not a bar's percentage. */
  temp: string;
  /** Lap delta against the hard, as the timing screen would print it. */
  pace: string;
}

/** A livery: two colours, split on the diagonal in the picker. */
export interface Livery {
  name: string;
  /** Body. */
  a: string;
  /** Accent — wings, sidepod flash, wheel rings. */
  b: string;
}

/**
 * A point on the car worth naming, and where it lives in 3D.
 *
 * `t` is the scroll position through the pinned section at which it appears.
 * `anchor` is a point in the car's own model space; the projection to screen
 * pixels happens every frame, because the camera is moving.
 */
export interface Hotspot {
  /** 0–1 through the pin. */
  t: number;
  anchor: [number, number, number];
  n: string;
  title: string;
  body: string;
}

/** One image in the paddock grid and the lightbox behind it. */
export interface Shot {
  src: string;
  /** CSS grid spans — the grid is 12 columns. */
  col: string;
  row: string;
  /** object-position. */
  pos: string;
  n: string;
  title: string;
  alt: string;
  /** Unsplash requires this beside the photograph. See `data.ts`. */
  credit: string;
  href?: string;
}

/** A round on the calendar. */
export interface Race {
  round: string;
  city: string;
  circuit: string;
  /** Lap length in km, as a string so trailing zeros survive. */
  len: string;
}

export interface MarqueeItem {
  a: string;
  b: string;
}

export interface DriverStat {
  v: string;
  l: string;
}
