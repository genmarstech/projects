/**
 * Seven days in a valley with no signal, run twice under two merge rules.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE WRONG MERGE CONVERGES PERFECTLY. THAT IS WHY IT SURVIVES IN PRODUCTION.
 *
 * Whole-record last-write-wins is what most sync layers ship, and it passes
 * the test everybody writes: run the same edits in any order on any number
 * of devices and they all agree at the end. It is consistent. It is also
 * eating writes, and the data it produces looks exactly like data nobody
 * ever lost anything from.
 *
 * So this module runs both rules against the same week and lists, by name,
 * every observation the record-level rule discarded. An argument about
 * merge semantics is not winnable in the abstract; a list of six things a
 * named officer wrote down and the system threw away is.
 * ══════════════════════════════════════════════════════════════════════════
 */

import {
  type ActorId,
  type Farm,
  type RegField,
  REG_FIELDS,
  bumpCounter,
  counterValue,
  digest,
  mergeFarm,
  mergeFarmWholeRecord,
  reg,
} from "./crdt";
import { ACTORS, DAY_NAMES, WEEK, seedFarms } from "./data";

export type Lost = {
  farmId: string;
  /** The field, or "pests" for the tally. */
  field: RegField | "pests";
  kept: string;
  instead: string;
  author: ActorId;
  day: number;
  why: string;
};

export type Replay = {
  day: number;
  /** What each device holds, having spoken to nobody. */
  perActor: Record<ActorId, Record<string, Farm>>;
  /** Everything merged field by field. */
  field: Record<string, Farm>;
  /** Everything merged a whole record at a time. */
  record: Record<string, Farm>;
  lost: Lost[];
  digests: {
    /** Merged A, B, C. */
    field: string;
    /** Merged C, B, A. Must equal the line above. */
    fieldReversed: string;
    record: string;
  };
  applied: number;
};

const ACTOR_IDS = Object.keys(ACTORS);

/** One device's state after `throughDay`, having synced with nobody. */
const replicaFor = (actor: ActorId, throughDay: number): Record<string, Farm> => {
  const farms = seedFarms();
  let clock = 0;

  for (const edit of WEEK) {
    if (edit.actor !== actor || edit.day > throughDay) continue;
    const farm = farms[edit.farmId];
    if (!farm) continue;

    clock += 1;
    const at = Date.UTC(2026, 8, 21 + edit.day, 9 + (clock % 7));

    if (edit.pests !== undefined) {
      farms[edit.farmId] = { ...farm, pests: bumpCounter(farm.pests, actor, edit.pests) };
    } else if (edit.field) {
      farms[edit.farmId] = { ...farm, [edit.field]: reg(edit.value, clock, actor, at) };
    }
  }

  return farms;
};

const foldWith = (
  rule: (a: Farm, b: Farm) => Farm,
  replicas: Record<string, Farm>[],
): Record<string, Farm> => {
  const out: Record<string, Farm> = {};
  for (const replica of replicas) {
    for (const [id, farm] of Object.entries(replica)) {
      out[id] = out[id] ? rule(out[id], farm) : farm;
    }
  }
  return out;
};

const show = (v: unknown): string => {
  if (typeof v === "string") return v.length > 72 ? `${v.slice(0, 69)}…` : v;
  return String(v);
};

export const replay = (throughDay: number): Replay => {
  const perActor: Record<ActorId, Record<string, Farm>> = {};
  for (const actor of ACTOR_IDS) perActor[actor] = replicaFor(actor, throughDay);

  const inOrder = ACTOR_IDS.map((a) => perActor[a]);
  const field = foldWith(mergeFarm, inOrder);
  const fieldReversed = foldWith(mergeFarm, [...inOrder].reverse());
  const record = foldWith(mergeFarmWholeRecord, inOrder);

  const lost: Lost[] = [];

  for (const id of Object.keys(field).sort()) {
    for (const f of REG_FIELDS) {
      if (field[id][f].v === record[id][f].v) continue;
      const author = field[id][f].a;
      const edit = WEEK.find(
        (e) => e.actor === author && e.farmId === id && e.field === f && e.day <= throughDay,
      );
      lost.push({
        farmId: id,
        field: f,
        kept: show(field[id][f].v),
        instead: show(record[id][f].v),
        author: actorName(author),
        day: edit?.day ?? 0,
        why: edit?.why ?? "",
      });
    }

    const a = counterValue(field[id].pests);
    const b = counterValue(record[id].pests);
    if (a !== b) {
      const edits = WEEK.filter((e) => e.farmId === id && e.pests && e.day <= throughDay);
      lost.push({
        farmId: id,
        field: "pests",
        kept: `${a} sightings`,
        instead: `${b} sightings`,
        author: edits.map((e) => ACTORS[e.actor].name).join(", "),
        day: edits[edits.length - 1]?.day ?? 0,
        why: `${edits.length} separate counts on one plot`,
      });
    }
  }

  return {
    day: throughDay,
    perActor,
    field,
    record,
    lost,
    digests: {
      field: digest(field),
      fieldReversed: digest(fieldReversed),
      record: digest(record),
    },
    applied: WEEK.filter((e) => e.day <= throughDay).length,
  };
};

export const dayName = (day: number): string => DAY_NAMES[day] ?? `Day ${day}`;

/** `origin` is the seed, which has no device and no name. */
export const actorName = (id: ActorId): string =>
  id === "origin" ? "the seed" : (ACTORS[id]?.name ?? id);
