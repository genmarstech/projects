import { useCallback, useEffect, useRef, useState } from "react";

import { Field } from "./Field";
import { Week } from "./Week";
import { type Replica } from "./crdt";
import { ACTORS, ME } from "./data";
import {
  type Device,
  type LogLine,
  type Mode,
  forget,
  loadDevice,
  loadServer,
  saveDevice,
  saveServer,
} from "./store";

type Tab = "field" | "week";

export const App = () => {
  const [tab, setTab] = useState<Tab>("field");
  const [device, setDevice] = useState<Device>(loadDevice);
  const [server, setServer] = useState<Replica>(loadServer);
  const [mode, setMode] = useState<Mode>("patchy");
  const [log, setLog] = useState<LogLine[]>([]);
  const nextId = useRef(1);

  // Persisted on every change rather than on a timer or on unload. A field
  // worker closes the tab by locking the phone, and `beforeunload` is not
  // reliably delivered when that happens.
  useEffect(() => saveDevice(device), [device]);
  useEffect(() => saveServer(server), [server]);

  const pushLog = useCallback((lines: Omit<LogLine, "id">[]) => {
    setLog((prev) => [
      ...lines.map((l) => ({ ...l, id: nextId.current++ })).reverse(),
      ...prev,
    ].slice(0, 60));
  }, []);

  const reset = useCallback(() => {
    forget();
    setDevice(loadDevice());
    setServer(loadServer());
    setLog([]);
  }, []);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="wordmark">Shamba</span>
          <span className="masthead__rule" aria-hidden="true" />
          <span className="masthead__sub">
            field records that survive a week without signal
          </span>
        </div>

        <p className="notice">
          A Genmars Tech demonstration. Nothing leaves your browser — the
          “server” is a second replica in the same tab, and the network is
          simulated so its failures can be chosen rather than waited for.
          The farms and the farmers are invented; the wards and the crops
          are real.
        </p>

        <nav className="tabs" aria-label="Sections">
          <button
            type="button"
            className={`tab${tab === "field" ? " is-on" : ""}`}
            aria-current={tab === "field" ? "page" : undefined}
            onClick={() => setTab("field")}
          >
            The phone
            <span>{ACTORS[ME].name}&rsquo;s device, working</span>
          </button>
          <button
            type="button"
            className={`tab${tab === "week" ? " is-on" : ""}`}
            aria-current={tab === "week" ? "page" : undefined}
            onClick={() => setTab("week")}
          >
            The week
            <span>three devices, two merge rules</span>
          </button>
        </nav>
      </header>

      {tab === "field" ? (
        <Field
          device={device}
          server={server}
          mode={mode}
          log={log}
          onDevice={setDevice}
          onServer={setServer}
          onMode={setMode}
          onLog={pushLog}
          onForget={reset}
        />
      ) : (
        <Week />
      )}

      <footer className="foot">
        <p>
          The merge is field-level, tiebroken on a Lamport counter rather
          than a wall clock, with tallies stored per device and summed. It
          is commutative, associative and idempotent — which is why the
          outbox above has no sequence numbers, no deduplication table and
          no exactly-once delivery. An op applied twice is indistinguishable
          from an op applied once, so none of that machinery has anything
          left to protect.
        </p>
      </footer>
    </div>
  );
};
