import type {
  Compound,
  DriverStat,
  Hotspot,
  Livery,
  MarqueeItem,
  Race,
  Shot,
} from "./types";

/**
 * Everything the page says, in one file.
 *
 * ── THIS IS A CONCEPT, AND THE COPY HAS TO KEEP SAYING SO ───────────────────
 *
 * Scuderia Nero is invented. No team, driver or sponsor here is real, and the
 * footer says as much in plain words. The figures below are plausible rather
 * than measured — they are set dressing for a design piece, and nothing in
 * this repository should present them as a specification.
 *
 * ⚠ THE TWO LOCAL IMAGES CONTRADICT THAT, AND HAVE NOT BEEN CLEARED.
 *
 *   `assets/car.jpg` is a render of a real Formula 1 car carrying a real
 *   team's marks — the prancing horse, car number 16, and the livery of
 *   Shell, Santander, Richard Mille, Ray-Ban, HCLTech, VGW, AWS, Pirelli,
 *   Brembo, NGK and SKF. `assets/helmet.jpg` came from the same set. They
 *   arrived with the design file, credited there as "concept imagery", which
 *   they are not.
 *
 *   A footer line saying "not affiliated with any team" does not licence
 *   somebody else's trade dress, and Charter 04 §IV does not allow a credit
 *   that says otherwise — so the credits below say what is actually known.
 *   See the README before this is published anywhere public.
 */

/** Unsplash CDN address for a photo id, at the width the grid actually uses. */
const U = (id: string, w = 1800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const MARQUEE: MarqueeItem[] = [
  { a: "1,000 HP", b: "Hybrid" },
  { a: "352 KM/H", b: "Vmax" },
  { a: "0–100", b: "2.4 s" },
  { a: "798 KG", b: "Min mass" },
  { a: "5.2 G", b: "Cornering" },
  { a: "50/50", b: "ICE · ERS" },
];

export const LIVERIES: Livery[] = [
  { name: "Nero", a: "#0b0b0c", b: "#e10600" },
  { name: "Bianco", a: "#edeae4", b: "#e10600" },
  { name: "Rosso", a: "#e10600", b: "#0b0b0c" },
  { name: "Giallo", a: "#0b0b0c", b: "#ffd12e" },
];

export const COMPOUNDS: Compound[] = [
  { name: "Soft", color: "#e10600", grip: 96, life: 38, temp: "90–110°C", pace: "−0.6s" },
  { name: "Medium", color: "#ffd12e", grip: 82, life: 64, temp: "95–120°C", pace: "−0.3s" },
  { name: "Hard", color: "#f2f2f2", grip: 68, life: 90, temp: "105–135°C", pace: "Ref" },
  { name: "Inter", color: "#3dbe5b", grip: 74, life: 58, temp: "40–90°C", pace: "Damp" },
  { name: "Wet", color: "#2f7bff", grip: 70, life: 52, temp: "30–70°C", pace: "Standing water" },
];

/**
 * The four callouts on the pinned car, with the model-space point each one
 * hangs off.
 *
 * The design hard-coded a screen percentage per hotspot (`x: '11%'`) and then
 * overwrote it every frame with a projected position, so the percentages were
 * dead values that only decided where the pin sat for one frame before the
 * 3D scene loaded. Only the anchors are kept here; the projection is the
 * single source of position, and a hotspot stays hidden until it has one.
 */
export const HOTSPOTS: Hotspot[] = [
  {
    t: 0.26,
    anchor: [2.8, 0.26, 0.95],
    n: "01 / FRONT WING",
    title: "Active front wing",
    body: "Two-position flaps drop drag on the straights and bite again under braking.",
  },
  {
    t: 0.4,
    anchor: [0.62, 0.96, 0],
    n: "02 / HALO",
    title: "Titanium halo",
    body: "Carries 12 tonnes of load — the lightest life-saving part on the car.",
  },
  {
    t: 0.54,
    anchor: [-0.9, 0.92, 0.25],
    n: "03 / POWER UNIT",
    title: "1.6 V6 hybrid",
    body: "Half combustion, half electric. 350 kW from the MGU-K alone.",
  },
  {
    t: 0.68,
    anchor: [-2.4, 1.2, 0.55],
    n: "04 / REAR WING",
    title: "X-mode rear",
    body: "The mainplane opens flat at speed and shuts for corner downforce.",
  },
];

export const DRIVER_STATS: DriverStat[] = [
  { v: "16", l: "Car number" },
  { v: "5.2G", l: "Peak lateral" },
  { v: "1.4s", l: "Visor to throttle" },
];

export const DRIVER_QUOTE =
  "“Behind the visor it goes quiet. The car does the shouting.”";

export const RACES: Race[] = [
  { round: "18", city: "Singapore", circuit: "Marina Bay Street Circuit", len: "4.927" },
  { round: "19", city: "Austin", circuit: "Circuit of the Americas", len: "5.513" },
  { round: "20", city: "Mexico City", circuit: "Autódromo Hermanos Rodríguez", len: "4.304" },
  { round: "21", city: "São Paulo", circuit: "Interlagos", len: "4.309" },
  { round: "22", city: "Las Vegas", circuit: "Las Vegas Strip Circuit", len: "6.201" },
  { round: "23", city: "Lusail", circuit: "Lusail International Circuit", len: "5.419" },
  { round: "24", city: "Abu Dhabi", circuit: "Yas Marina Circuit", len: "5.281" },
];

/**
 * The paddock grid, and the lightbox behind it.
 *
 * ⚠ THE CREDIT TRAVELS WITH THE PHOTOGRAPH. Unsplash's licence requires
 *   attribution, and the lightbox prints `credit` as a link to `href`. An
 *   entry with a remote `src` and no credit is a licence breach that looks
 *   like a missing caption — the two local renders are the only ones exempt,
 *   because they came with the design.
 */
export const GALLERY: Shot[] = [
  {
    src: "assets/helmet.jpg",
    col: "span 7",
    row: "span 2",
    pos: "50% 40%",
    n: "01",
    title: "Visor down",
    alt: "Driver helmet in close-up, visor lowered",
    credit: "Source image supplied with the design — provenance unconfirmed",
  },
  {
    src: U("1543061647-e034089f6a2b"),
    col: "span 5",
    row: "span 1",
    pos: "50% 50%",
    n: "02",
    title: "Two seconds flat",
    alt: "Pit crew swarming a Formula 1 car during a stop",
    credit: "Photo by Chi Hang Leong on Unsplash",
    href: "https://unsplash.com/photos/f4Ct41XVGag",
  },
  {
    src: U("1659203206829-218b9b5930e5"),
    col: "span 5",
    row: "span 1",
    pos: "50% 50%",
    n: "03",
    title: "Grid walk",
    alt: "Crew gathered around a race car on the starting grid",
    credit: "Photo by Marc Kleen on Unsplash",
    href: "https://unsplash.com/photos/8CqwTEGPLmo",
  },
  {
    src: U("1614949194403-9602bdc14a3a"),
    col: "span 4",
    row: "span 2",
    pos: "50% 50%",
    n: "04",
    title: "Red on black",
    alt: "Red and black Formula 1 car on track",
    credit: "Photo by Clément Delacre on Unsplash",
    href: "https://unsplash.com/photos/M5s9Ffs1KqU",
  },
  {
    src: "assets/car.jpg",
    col: "span 8",
    row: "span 2",
    pos: "30% 60%",
    n: "05",
    title: "SF-N, livery reveal",
    alt: "Formula 1 car in side profile, black livery with red markings",
    credit: "Source image supplied with the design — provenance unconfirmed",
  },
  {
    src: U("1763514354318-4dc78884b26c"),
    col: "span 4",
    row: "span 2",
    pos: "50% 50%",
    n: "06",
    title: "Head on",
    alt: "Front view of a red Formula 1 car",
    credit: "Photo by Veerender Mothukuri on Unsplash",
    href: "https://unsplash.com/photos/iToMHOihS2A",
  },
  {
    src: U("1767408906599-e4e3aa8698fd"),
    col: "span 4",
    row: "span 2",
    pos: "50% 50%",
    n: "07",
    title: "Flat out",
    alt: "Red race car at speed, panned",
    credit: "Photo by Mark Jeremy on Unsplash",
    href: "https://unsplash.com/photos/MpgTrJ4vIxk",
  },
  {
    src: U("1638552708183-52e302a55e15"),
    col: "span 4",
    row: "span 2",
    pos: "50% 50%",
    n: "08",
    title: "Monochrome",
    alt: "Black and white photograph of a racing car",
    credit: "Photo by Chethan Kanakamurthy on Unsplash",
    href: "https://unsplash.com/photos/DAhUu3oe64I",
  },
];

/**
 * Which gallery shot previews beside the cursor for each calendar row.
 *
 * Indices into `GALLERY`, one per race, in the order the rows appear. The
 * first two rows deliberately skip the local renders — a preview of the car
 * you have already scrolled past reads as a placeholder.
 */
export const RACE_SHOT = [6, 3, 7, 2, 1, 4, 5];

/** How many sections the lap counter in the nav is counting through. */
export const TOTAL_LAPS = 6;
