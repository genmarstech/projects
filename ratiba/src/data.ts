/**
 * One 24-hour pharmacy, ten people, and four weeks worth arguing about.
 *
 * Invented, in the ordinary way a worked example is: these are not anyone's
 * staff and the branch does not exist. The shape is the real one — a
 * registered pharmacist on every shift including the night, technicians on
 * dispensing in the mornings only, counter assistants across the day.
 */

import { type RoleId, type ShiftId, type Staff } from "./model";

/**
 * Cover is narrower than the template in `model.ts` would suggest.
 *
 * The evening drops the technician and the night runs on a pharmacist
 * alone, which is what a branch this size actually staffs. Written here
 * rather than in the model because it is a commercial decision about one
 * branch, and the model should not have to be edited to roster a different
 * one.
 */
export const COVER: Record<ShiftId, Partial<Record<RoleId, number>>> = {
  morning: { pharmacist: 1, technician: 1, assistant: 1 },
  evening: { pharmacist: 1, assistant: 1 },
  night: { pharmacist: 1 },
};

export const STAFF: Staff[] = [
  { id: "p-achieng", name: "Achieng", role: "pharmacist", contract: 40, maxHours: 45, unavailable: [], prefers: ["morning"] },
  { id: "p-otieno", name: "Otieno", role: "pharmacist", contract: 40, maxHours: 45, unavailable: [], prefers: ["night"] },
  { id: "p-mwikali", name: "Mwikali", role: "pharmacist", contract: 40, maxHours: 45, unavailable: [], prefers: [] },
  { id: "p-kiprop", name: "Kiprop", role: "pharmacist", contract: 32, maxHours: 40, unavailable: [], prefers: ["evening", "night"] },
  { id: "p-njoki", name: "Njoki", role: "pharmacist", contract: 24, maxHours: 32, unavailable: [], prefers: ["morning"] },

  { id: "t-barasa", name: "Barasa", role: "technician", contract: 32, maxHours: 40, unavailable: [], prefers: [] },
  { id: "t-chepkoech", name: "Chepkoech", role: "technician", contract: 24, maxHours: 32, unavailable: [], prefers: ["morning"] },

  { id: "a-wafula", name: "Wafula", role: "assistant", contract: 40, maxHours: 45, unavailable: [], prefers: [] },
  { id: "a-atieno", name: "Atieno", role: "assistant", contract: 40, maxHours: 45, unavailable: [], prefers: ["evening"] },
  { id: "a-mutiso", name: "Mutiso", role: "assistant", contract: 32, maxHours: 40, unavailable: [], prefers: ["morning"] },
];

export type Preset = {
  id: string;
  name: string;
  blurb: string;
  /** Staff id → day indices off. */
  leave: Record<string, number[]>;
  /** `day:shift` → extra heads by role. */
  extraCover?: Record<string, Partial<Record<RoleId, number>>>;
};

export const PRESETS: Preset[] = [
  {
    id: "ordinary",
    name: "An ordinary week",
    blurb: "Nobody away. The rota exists; the question is whether it is a fair one.",
    leave: {},
  },
  {
    id: "leave",
    name: "Two away",
    blurb:
      "Mwikali has Monday to Wednesday and Wafula has the weekend. Still solvable, and the cost of it lands on somebody.",
    leave: { "p-mwikali": [0, 1, 2], "a-wafula": [4, 5, 6] },
  },
  {
    id: "audit",
    name: "Stock-take weekend",
    blurb:
      "A second counter assistant on Saturday morning, on top of the ordinary cover. Three assistants, two of them needed at once — and the one who takes it cannot have Friday evening.",
    leave: {},
    extraCover: { "5:morning": { assistant: 1 } },
  },
  {
    id: "impossible",
    name: "The week that cannot be rostered",
    blurb:
      "Three of five pharmacists away across the back half of the week. The solver should not say “no solution found”; it should say which shift and which rule.",
    leave: {
      "p-mwikali": [3, 4, 5, 6],
      "p-kiprop": [4, 5, 6],
      "p-njoki": [2, 3, 4, 5, 6],
      "t-chepkoech": [5, 6],
    },
  },
];

export const withLeave = (preset: Preset): Staff[] =>
  STAFF.map((p) => ({ ...p, unavailable: preset.leave[p.id] ?? [] }));
