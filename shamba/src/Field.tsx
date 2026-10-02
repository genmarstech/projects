import { useMemo, useState } from "react";

import {
  STAGES,
  type RegField,
  type Replica,
  type Stage,
  counterValue,
  digest,
} from "./crdt";
import { ACTORS, ME } from "./data";
import {
  type Device,
  type LogLine,
  type Mode,
  colleagueEdits,
  editField,
  flush,
  pendingFields,
  tallyPest,
} from "./store";

type Props = {
  device: Device;
  server: Replica;
  mode: Mode;
  log: LogLine[];
  onDevice: (d: Device) => void;
  onServer: (r: Replica) => void;
  onMode: (m: Mode) => void;
  onLog: (lines: Omit<LogLine, "id">[]) => void;
  onForget: () => void;
};

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "offline", label: "No signal", hint: "Nothing leaves the phone." },
  { value: "patchy", label: "Patchy", hint: "Some pushes are lost. Some acknowledgements are lost after the server has already applied them." },
  { value: "online", label: "Signal", hint: "Every round trip completes." },
];

const TEXT_FIELDS: { key: RegField; label: string; long?: boolean }[] = [
  { key: "farmer", label: "Farmer" },
  { key: "ward", label: "Ward" },
  { key: "crop", label: "Crop" },
];

export const Field = ({
  device,
  server,
  mode,
  log,
  onDevice,
  onServer,
  onMode,
  onLog,
  onForget,
}: Props) => {
  const ids = useMemo(
    () => Object.keys(device.replica.farms).filter((id) => !device.replica.farms[id].deleted.v).sort(),
    [device.replica.farms],
  );
  const [selected, setSelected] = useState(ids[0] ?? "f-01");
  const farm = device.replica.farms[selected];
  const pending = useMemo(() => new Set(pendingFields(device, selected)), [device, selected]);

  const deviceDigest = digest(device.replica.farms);
  const serverDigest = digest(server.farms);
  const agreed = deviceDigest === serverDigest;

  const apply = <T,>(field: RegField, value: T, label: string) => {
    onDevice(editField(device, selected, field, value));
    onLog([{ at: Date.now(), kind: "edit", text: `${label} — held on this phone.` }]);
  };

  const doSync = () => {
    const result = flush(device, server, mode);
    onDevice(result.device);
    onServer(result.server);
    onLog(result.lines);
  };

  const simulateColleague = () => {
    const next = colleagueEdits(
      server,
      selected,
      "notes",
      `Wairimu, same plot: advised a second scouting round. (${new Date().toLocaleTimeString()})`,
    );
    onServer(next);
    onLog([
      {
        at: Date.now(),
        kind: "note",
        text: "Wairimu edited the notes on this record, from her own phone. This device has not heard yet.",
      },
    ]);
  };

  if (!farm) return <p className="empty">No record selected.</p>;

  const chip = (key: RegField) =>
    pending.has(key) ? (
      <span className="chip chip--pending" title="Saved on this phone. The server has not confirmed it.">
        on this phone
      </span>
    ) : (
      <span className="chip chip--synced" title="The server has this value.">
        synced
      </span>
    );

  return (
    <div className="field">
      <aside className="farms" aria-label="Records">
        <ul>
          {ids.map((id) => {
            const f = device.replica.farms[id];
            const dirty = device.dirty.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`farms__btn${id === selected ? " is-on" : ""}`}
                  onClick={() => setSelected(id)}
                  aria-current={id === selected ? "true" : undefined}
                >
                  <span className="farms__name">{f.farmer.v}</span>
                  <span className="farms__meta">
                    {f.ward.v} · {f.crop.v}
                  </span>
                  {dirty && <span className="dot" aria-label="unsent changes" />}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="record" aria-label="Record">
        <header className="record__head">
          <h2>{farm.farmer.v}</h2>
          <p className="record__sub">
            {farm.ward.v} · {farm.plotHa.v} ha · last touched by{" "}
            {ACTORS[farm.notes.a]?.name ?? "the seed"}
          </p>
        </header>

        <div className="rows">
          {TEXT_FIELDS.map(({ key }) => (
            <label className="row" key={key}>
              <span className="row__label">
                {key === "farmer" ? "Farmer" : key === "ward" ? "Ward" : "Crop"}
                {chip(key)}
              </span>
              <input
                type="text"
                value={String(farm[key].v)}
                onChange={(e) => apply(key, e.target.value, `${key} set`)}
              />
            </label>
          ))}

          <label className="row">
            <span className="row__label">
              Plot size (ha){chip("plotHa")}
            </span>
            <input
              type="number"
              step="0.05"
              min="0"
              value={farm.plotHa.v}
              onChange={(e) => apply("plotHa", Number(e.target.value), "Plot size set")}
            />
          </label>

          <label className="row">
            <span className="row__label">
              Stage{chip("stage")}
            </span>
            <select
              value={farm.stage.v}
              onChange={(e) => apply("stage", e.target.value as Stage, "Stage set")}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="row row--wide">
            <span className="row__label">
              Notes{chip("notes")}
            </span>
            <textarea
              rows={3}
              value={farm.notes.v}
              onChange={(e) => apply("notes", e.target.value, "Notes edited")}
            />
          </label>

          <div className="row row--wide">
            <span className="row__label">
              Pest sightings
              {/*
                No chip here. A tally has no single author and no single
                write to be pending — it is the sum of what every device has
                ever added. Putting a one-or-the-other badge on it would be
                describing it as a value, which is exactly the mistake the
                merge underneath refuses to make.
              */}
              <span className="chip chip--counter">tally, not a value</span>
            </span>
            <div className="tally">
              <button type="button" className="btn" onClick={() => {
                onDevice(tallyPest(device, selected, -1));
                onLog([{ at: Date.now(), kind: "edit", text: "Tally −1." }]);
              }}>
                −
              </button>
              <output className="tally__n">{counterValue(farm.pests)}</output>
              <button type="button" className="btn" onClick={() => {
                onDevice(tallyPest(device, selected, 1));
                onLog([{ at: Date.now(), kind: "edit", text: "Tally +1." }]);
              }}>
                +
              </button>
              <span className="tally__note">
                {Object.keys(farm.pests).length === 0
                  ? "nobody has counted yet"
                  : `${Object.entries(farm.pests)
                      .map(([a, n]) => `${ACTORS[a]?.name ?? a} ${n.inc - n.dec}`)
                      .join(" · ")}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      <aside className="sync" aria-label="Sync">
        <h2>Network</h2>
        <div className="modes" role="group" aria-label="Network condition">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`btn btn--chip${mode === m.value ? " is-on" : ""}`}
              aria-pressed={mode === m.value}
              onClick={() => onMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="sync__hint">{MODES.find((m) => m.value === mode)?.hint}</p>

        <dl className="meter">
          <div>
            <dt>Outbox</dt>
            <dd>
              {device.dirty.length} record{device.dirty.length === 1 ? "" : "s"}
            </dd>
          </div>
          <div>
            <dt>Last exchange</dt>
            <dd>
              {device.lastSyncAt
                ? new Date(device.lastSyncAt).toLocaleTimeString()
                : "never"}
            </dd>
          </div>
          <div>
            <dt>This phone</dt>
            <dd className="mono">{deviceDigest}</dd>
          </div>
          <div>
            <dt>Server</dt>
            <dd className="mono">{serverDigest}</dd>
          </div>
        </dl>

        <p className={`verdict${agreed ? " is-good" : ""}`}>
          {agreed
            ? "The two digests match. Both sides hold the same record."
            : "The digests differ. Something here has not reached the server, or something there has not reached here."}
        </p>

        <div className="sync__buttons">
          <button type="button" className="btn btn--primary" onClick={doSync}>
            Sync now
          </button>
          <button type="button" className="btn" onClick={simulateColleague}>
            Wairimu edits this
          </button>
        </div>

        <p className="sync__hint">
          Everything on this phone survives a reload — the records, the
          outbox and the server's own copy are all persisted. That is the
          only honest test of an offline-first store: close the tab mid-queue
          and come back.
        </p>

        <h3>Log</h3>
        <ol className="log">
          {log.slice(0, 14).map((line) => (
            <li key={line.id} className={`log__${line.kind}`}>
              <time>{new Date(line.at).toLocaleTimeString()}</time>
              <span>{line.text}</span>
            </li>
          ))}
          {log.length === 0 && <li className="log__note"><span>Nothing yet. Edit a field.</span></li>}
        </ol>

        <button type="button" className="btn btn--quiet" onClick={onForget}>
          Clear this device ({ACTORS[ME].name})
        </button>
      </aside>
    </div>
  );
};
