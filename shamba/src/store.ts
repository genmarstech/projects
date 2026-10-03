/**
 * The device, the outbox, and a network that is usually not there.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE OUTBOX IS DELIBERATELY STUPID, AND IT IS ALLOWED TO BE.
 *
 * No sequence numbers, no deduplication table, no exactly-once delivery, no
 * reconciliation pass. It holds a set of record ids that have unsent
 * changes, and a flush sends the current state of each.
 *
 * Every one of those mechanisms exists to stop a message being applied
 * twice. The merge in `crdt.ts` is idempotent, so applying a message twice
 * is indistinguishable from applying it once, and all of that machinery has
 * nothing left to protect. Picking a data model that cannot be corrupted by
 * a retry is cheaper than building the apparatus that prevents retries.
 *
 * ⚠ THE LOST ACKNOWLEDGEMENT IS THE CASE TO TEST, AND THE PAGE SIMULATES IT.
 *   "Patchy" fails some flushes AFTER the server has already applied them.
 *   The device does not know, keeps the records dirty, and sends again.
 *   Nothing downstream notices, which is the whole point.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── WHY LOCALSTORAGE AND NOT INDEXEDDB ─────────────────────────────────────
 *
 * The real thing would use IndexedDB: a week of records with photographs
 * will pass the 5 MB localStorage ceiling, and a synchronous write on the
 * main thread is a frame drop in a form somebody is typing into.
 *
 * This holds six records of text. Reaching for the asynchronous store here
 * would add a schema, a migration path and a transaction wrapper to protect
 * against a limit this cannot approach. What is worth copying from this
 * file is not the storage call — it is that persistence sits behind
 * `load`/`save` and nothing above knows which it is.
 */

import {
  type ActorId,
  type Farm,
  type RegField,
  type Replica,
  REG_FIELDS,
  bumpCounter,
  mergeInto,
  reg,
} from "./crdt";
import { ME, seedFarms } from "./data";

const KEY_DEVICE = "shamba.device.v1";
const KEY_SERVER = "shamba.server.v1";

export type Device = {
  replica: Replica;
  /** Record ids with changes the server has not confirmed. */
  dirty: string[];
  /**
   * What the server was last known to hold.
   *
   * Kept so the interface can tell "saved on this phone" from "the server
   * has it" without asking the network. Those are different facts and a
   * form that shows one tick for both is lying to somebody standing in a
   * field deciding whether they can leave.
   */
  acked: Record<string, Farm>;
  lastSyncAt: number | null;
};

export type Mode = "offline" | "patchy" | "online";

export type LogLine = {
  id: number;
  at: number;
  kind: "edit" | "flush" | "fail" | "merge" | "note";
  text: string;
};

// ── Persistence ──────────────────────────────────────────────────────────

const read = <T,>(key: string, fallback: () => T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback();
  } catch {
    // A private window, a full quota, a half-written value from a crash. The
    // application works without storage; it just forgets. Falling over here
    // would be a worse outcome than that.
    return fallback();
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* See above. A failed save is not a reason to lose what is on screen. */
  }
};

export const loadDevice = (): Device =>
  read(KEY_DEVICE, () => ({
    replica: { actor: ME, clock: 1, farms: seedFarms() },
    dirty: [],
    acked: seedFarms(),
    lastSyncAt: null,
  }));

export const loadServer = (): Replica =>
  read(KEY_SERVER, () => ({ actor: "server", clock: 1, farms: seedFarms() }));

export const saveDevice = (d: Device) => write(KEY_DEVICE, d);
export const saveServer = (r: Replica) => write(KEY_SERVER, r);

export const forget = () => {
  try {
    localStorage.removeItem(KEY_DEVICE);
    localStorage.removeItem(KEY_SERVER);
  } catch {
    /* Nothing to clear if there was nothing to store. */
  }
};

// ── Local edits ──────────────────────────────────────────────────────────

export const editField = <T,>(
  device: Device,
  farmId: string,
  field: RegField,
  value: T,
): Device => {
  const farm = device.replica.farms[farmId];
  if (!farm) return device;

  const clock = device.replica.clock + 1;
  const next: Farm = { ...farm, [field]: reg(value, clock, device.replica.actor, Date.now()) };

  return {
    ...device,
    replica: { ...device.replica, clock, farms: { ...device.replica.farms, [farmId]: next } },
    dirty: device.dirty.includes(farmId) ? device.dirty : [...device.dirty, farmId],
  };
};

export const tallyPest = (device: Device, farmId: string, by: number): Device => {
  const farm = device.replica.farms[farmId];
  if (!farm) return device;

  const next: Farm = { ...farm, pests: bumpCounter(farm.pests, device.replica.actor, by) };

  return {
    ...device,
    replica: {
      ...device.replica,
      clock: device.replica.clock + 1,
      farms: { ...device.replica.farms, [farmId]: next },
    },
    dirty: device.dirty.includes(farmId) ? device.dirty : [...device.dirty, farmId],
  };
};

/** Fields this device has changed and the server has not confirmed. */
export const pendingFields = (device: Device, farmId: string): RegField[] => {
  const mine = device.replica.farms[farmId];
  const theirs = device.acked[farmId];
  if (!mine) return [];
  return REG_FIELDS.filter((f) => !theirs || mine[f].c > theirs[f].c);
};

// ── The wire ─────────────────────────────────────────────────────────────

export type FlushResult = {
  device: Device;
  server: Replica;
  lines: Omit<LogLine, "id">[];
};

const roll = (mode: Mode): { reaches: boolean; ackArrives: boolean } => {
  if (mode === "offline") return { reaches: false, ackArrives: false };
  if (mode === "online") return { reaches: true, ackArrives: true };
  // Patchy. Two separate coins on purpose: a request that never arrives and
  // a reply that never comes back look identical from the device and are
  // completely different on the server.
  const reaches = Math.random() > 0.32;
  return { reaches, ackArrives: reaches && Math.random() > 0.28 };
};

export const flush = (device: Device, server: Replica, mode: Mode): FlushResult => {
  const lines: Omit<LogLine, "id">[] = [];
  const at = Date.now();

  if (device.dirty.length === 0) {
    // Still a round trip: this is how the device hears about other people.
    const { reaches, ackArrives } = roll(mode);
    if (!reaches || !ackArrives) {
      lines.push({ at, kind: "fail", text: mode === "offline" ? "No signal. Nothing to send anyway." : "Poll lost in transit." });
      return { device, server, lines };
    }
    const pulled = mergeInto(device.replica, server.farms);
    lines.push({ at, kind: "merge", text: "Polled. Nothing of ours to send; took the server's state." });
    return {
      device: { ...device, replica: pulled, acked: server.farms, lastSyncAt: at },
      server,
      lines,
    };
  }

  const { reaches, ackArrives } = roll(mode);

  if (!reaches) {
    lines.push({
      at,
      kind: "fail",
      text:
        mode === "offline"
          ? `No signal. ${device.dirty.length} record${device.dirty.length === 1 ? "" : "s"} still waiting.`
          : `Push lost before it arrived. ${device.dirty.length} still waiting.`,
    });
    return { device, server, lines };
  }

  // The server merges whatever reached it. This happens whether or not the
  // device ever learns that it happened.
  const push: Record<string, Farm> = {};
  for (const id of device.dirty) push[id] = device.replica.farms[id];
  const nextServer = mergeInto(server, push);
  lines.push({ at, kind: "flush", text: `Server merged ${device.dirty.length} record${device.dirty.length === 1 ? "" : "s"}.` });

  if (!ackArrives) {
    lines.push({
      at,
      kind: "fail",
      text: "Acknowledgement lost. The device still thinks they are unsent, and will send them again — which changes nothing, because the merge is idempotent.",
    });
    return { device, server: nextServer, lines };
  }

  const pulled = mergeInto(device.replica, nextServer.farms);
  lines.push({ at, kind: "merge", text: "Took the server's state back. Both sides now agree." });

  return {
    device: { ...device, replica: pulled, dirty: [], acked: nextServer.farms, lastSyncAt: at },
    server: nextServer,
    lines,
  };
};

/** A second officer, so a conflict can be made without a second browser. */
export const colleagueEdits = (
  server: Replica,
  farmId: string,
  field: RegField,
  value: unknown,
  actor: ActorId = "d-wairimu",
): Replica => {
  const farm = server.farms[farmId];
  if (!farm) return server;
  const clock = server.clock + 1;
  return {
    ...server,
    clock,
    farms: {
      ...server.farms,
      [farmId]: { ...farm, [field]: reg(value, clock, actor, Date.now()) },
    },
  };
};
