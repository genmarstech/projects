/**
 * The farms, and the week.
 *
 * Wards are real places in Kiambu, Nyeri, Murang'a and Machakos, and the
 * crops are what is actually grown on smallholdings there. The farmers are
 * invented, as are every figure and every note — this is a demonstration of
 * a sync layer, not a record of anybody's land.
 */

import { type Farm, type Stage, reg } from "./crdt";

/** The device this browser is. The other two exist only in the replay. */
export const ME = "d-ndiritu";

export const ACTORS: Record<string, { name: string; role: string }> = {
  "d-ndiritu": { name: "Ndiritu", role: "Extension officer · Kiambu" },
  "d-wairimu": { name: "Wairimu", role: "Extension officer · Kiambu" },
  "d-clinic": { name: "Plant clinic", role: "Shared tablet · Limuru" },
};

type Seed = {
  id: string;
  farmer: string;
  ward: string;
  crop: string;
  plotHa: number;
  stage: Stage;
  notes: string;
};

const SEEDS: Seed[] = [
  { id: "f-01", farmer: "Jane Wanjiku", ward: "Ndeiya", crop: "Maize (H614)", plotHa: 0.8, stage: "Vegetative", notes: "Intercropped with beans. Last top-dress 14 days ago." },
  { id: "f-02", farmer: "Peter Kamau", ward: "Limuru Central", crop: "French beans", plotHa: 0.35, stage: "Vegetative", notes: "Contract with an exporter; residue window matters." },
  { id: "f-03", farmer: "Grace Nyokabi", ward: "Kinale", crop: "Potato (Shangi)", plotHa: 1.2, stage: "Vegetative", notes: "Blight pressure after the long rains." },
  { id: "f-04", farmer: "Samuel Mwangi", ward: "Githiga", crop: "Avocado (Hass)", plotHa: 2.0, stage: "Harvest", notes: "Third season bearing. 90 trees." },
  { id: "f-05", farmer: "Esther Njeri", ward: "Ngecha", crop: "Tomato (Rio Grande)", plotHa: 0.25, stage: "Flowering", notes: "Open field, no tunnel. Staked last week." },
  { id: "f-06", farmer: "Daniel Kariuki", ward: "Kijabe", crop: "Coffee (SL28)", plotHa: 0.6, stage: "Vegetative", notes: "Pruned in June. Pulping at the co-operative." },
];

/**
 * The starting state, as every replica first saw it.
 *
 * Counter 0 and the actor `origin`, so nothing in the seed can outrank a
 * real edit on a tiebreak — a seeded value losing to a field officer is the
 * correct outcome and should not depend on how the ids happen to sort.
 */
export const seedFarms = (): Record<string, Farm> => {
  const t = Date.UTC(2026, 8, 21);
  const out: Record<string, Farm> = {};
  for (const s of SEEDS) {
    out[s.id] = {
      id: s.id,
      farmer: reg(s.farmer, 0, "origin", t),
      ward: reg(s.ward, 0, "origin", t),
      crop: reg(s.crop, 0, "origin", t),
      plotHa: reg(s.plotHa, 0, "origin", t),
      stage: reg(s.stage, 0, "origin", t),
      notes: reg(s.notes, 0, "origin", t),
      pests: {},
      deleted: reg(false, 0, "origin", t),
    };
  }
  return out;
};

// ── The week ─────────────────────────────────────────────────────────────

export type WeekEdit = {
  day: number;
  actor: string;
  farmId: string;
  /** A register write, or a tally. */
  field?: "farmer" | "ward" | "crop" | "plotHa" | "stage" | "notes" | "deleted";
  value?: string | number | boolean;
  pests?: number;
  /** What the officer was doing. Shown in the log. */
  why: string;
};

/**
 * Seven days, three devices, one patchy valley.
 *
 * Chosen so that each of the three merge rules the page compares gets a
 * case it answers differently — a same-field clash, a different-field
 * clash on one record, and two tallies on one plot. The last is the one
 * most sync layers get wrong without anybody noticing.
 */
export const WEEK: WeekEdit[] = [
  { day: 1, actor: "d-ndiritu", farmId: "f-01", field: "stage", value: "Flowering", why: "Tasselling started" },
  { day: 1, actor: "d-wairimu", farmId: "f-03", field: "notes", value: "Blight confirmed on the lower block. Advised Ridomil, 7-day interval.", why: "Diagnosis" },
  { day: 2, actor: "d-ndiritu", farmId: "f-05", pests: 4, why: "Four whitefly on the trap card" },
  { day: 2, actor: "d-wairimu", farmId: "f-05", pests: 4, why: "Four more on the second card — same plot, same day" },
  { day: 2, actor: "d-wairimu", farmId: "f-01", field: "notes", value: "Striga seen at the field edge. Flag for follow-up.", why: "Different field, same record as Monday" },
  { day: 3, actor: "d-clinic", farmId: "f-02", field: "stage", value: "Harvest", why: "Sample brought to the clinic" },
  { day: 3, actor: "d-ndiritu", farmId: "f-02", field: "stage", value: "Flowering", why: "Visited the plot; the clinic had it wrong" },
  { day: 4, actor: "d-ndiritu", farmId: "f-04", field: "plotHa", value: 2.4, why: "Re-measured; the old figure excluded the lower terrace" },
  { day: 4, actor: "d-wairimu", farmId: "f-06", field: "notes", value: "CBD on two rows. Copper spray advised.", why: "Diagnosis" },
  { day: 5, actor: "d-wairimu", farmId: "f-04", field: "notes", value: "Fruit fly traps up. 90 trees confirmed.", why: "Different field again" },
  { day: 5, actor: "d-ndiritu", farmId: "f-03", pests: 2, why: "Two aphid colonies" },
  { day: 6, actor: "d-clinic", farmId: "f-05", pests: 3, why: "Third card, brought in by the farmer" },
  { day: 6, actor: "d-ndiritu", farmId: "f-06", field: "stage", value: "Flowering", why: "Early flowering on the top rows" },
  { day: 7, actor: "d-wairimu", farmId: "f-02", field: "notes", value: "Exporter needs the residue window in writing before the 30th.", why: "Follow-up" },
];

export const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
