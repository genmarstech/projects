/**
 * Turning a preset into a problem, in one place.
 *
 * The slot list is derived from the cover table rather than from the shift
 * templates, because a branch decides its own cover — see `COVER` in
 * `data.ts`. Both the worker and the tests build the problem through this,
 * so a rota the page shows and a rota a test asserts on cannot be answers
 * to two different questions.
 */

import { type Preset, COVER, withLeave } from "./data";
import { type Problem } from "./solver";
import { type RoleId, type Rules, type Slot, DAYS, SHIFTS } from "./model";

export const slotsFor = (preset: Preset): Slot[] => {
  const out: Slot[] = [];
  for (let day = 0; day < DAYS.length; day += 1) {
    for (const shift of SHIFTS) {
      const extra = preset.extraCover?.[`${day}:${shift.id}`] ?? {};
      const base = COVER[shift.id];
      for (const role of ["pharmacist", "technician", "assistant"] as RoleId[]) {
        const n = (base[role] ?? 0) + (extra[role] ?? 0);
        for (let i = 0; i < n; i += 1) {
          out.push({ id: `${day}:${shift.id}:${role}:${i}`, day, shift: shift.id, role, index: i });
        }
      }
    }
  }
  return out;
};

export const problemFor = (preset: Preset, rules: Rules): Problem => ({
  slots: slotsFor(preset),
  staff: withLeave(preset),
  rules,
});
