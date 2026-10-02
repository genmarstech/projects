# Shamba — field records that survive a week without signal

An extension officer works six smallholdings in a valley with no coverage.
So does a colleague. Some of those farms are the same farms. On Sunday
evening both phones reach the server at once.

This is the sync layer that makes that end well, and a side-by-side run of
the one that does not.

A Genmars Tech demonstration. Nothing leaves the browser — the "server" is a
second replica in the same tab, and the network is simulated so its failures
can be chosen rather than waited for.

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # typecheck + build, the gate before pushing
npm run build     # static bundle in dist/
npm run preview   # serve that bundle
```

---

## The problem is not "save when the signal comes back"

Queueing writes and replaying them in arrival order is the obvious design,
and it is wrong in a way that leaves no trace. The phone that happens to
find signal second overwrites the first with a week-old copy of every field
it never touched. Nothing fails. Nothing is logged. The record looks
complete.

So the merge has to give the same answer on both phones, in any order,
however many times it runs. Four decisions follow from that, and each is
written on the code that implements it in `src/crdt.ts`.

### 1. Field by field, not record by record

Two officers editing *different* fields of one record must both keep their
edit. That is the common case, not the exotic one: a diagnosis and a
re-measurement on the same farm in the same week.

### 2. A Lamport counter, not a wall clock

The obvious tiebreak is "latest timestamp wins". It cannot be used. A field
phone's clock is set by the handset, and a handset that has been off the
network for a week can be wrong by days. **One device whose clock runs three
days fast would win every conflict it was ever part of, for ever, and the
data would look fine.**

A Lamport counter only ever asserts "this happened after that". It is
incremented on every local write and lifted to `max(mine, theirs) + 1` on
every merge, so an edit made in response to something always outranks it.
The wall clock is still carried — purely so the interface can say "Tuesday"
to a human. Nothing merges on it.

### 3. A count is not a value

Two officers each log four aphid sightings on one plot. Under last-write-
wins the record ends up saying **four** — not because anything failed, but
because 4 and 4 merged to 4, correctly, under a rule that was the wrong rule
for that field.

Pest tallies are stored per device and summed. Eight sightings, from two
phones that never spoke.

### 4. Deletion is a field

A record removed by dropping it from the map comes straight back on the next
merge, carried by any replica that has not heard yet — and it comes back
with whatever that replica last knew, which is worse than it never having
gone. A tombstone is a write like any other.

---

## The outbox is deliberately stupid, and it is allowed to be

No sequence numbers. No deduplication table. No exactly-once delivery. No
reconciliation pass. It holds a set of record ids with unsent changes, and a
flush sends the current state of each.

Every one of those mechanisms exists to stop a message being applied twice.
The merge is idempotent, so applying a message twice is indistinguishable
from applying it once, and all of that machinery has nothing left to
protect. **Choosing a data model that cannot be corrupted by a retry is
cheaper than building the apparatus that prevents retries.**

The case to test is the lost acknowledgement, and the page simulates it
directly. On "Patchy", some flushes fail *after* the server has already
applied them. The device does not know, keeps the records dirty, and sends
again. Nothing downstream notices. That is the whole point.

## Two ticks, not one

The interface never says "saved" without saying where. A field is either
**on this phone** or **synced**, and those are different facts. A form that
shows one tick for both is lying to somebody standing in a field deciding
whether they can leave.

The pest tally has no such badge, and that is deliberate: a tally has no
single author and no single pending write. Putting a one-or-the-other chip
on it would be describing it as a value — exactly the mistake the merge
underneath refuses to make.

---

## The week

The second tab runs the same seven days twice: once merging field by field,
once a whole record at a time — the rule most sync layers ship.

**Both converge.** That is why the wrong one survives in production: it
passes the test everybody writes. Run the edits in any order, on any number
of devices, and every replica agrees. It is consistent. It is also eating
observations, and the data it produces looks exactly like data nobody ever
lost anything from.

So the page lists them. Six writes by Sunday, each by a named officer, each
replaced by an older value from a different device:

| Record | Field | Written | Whole-record gives |
|---|---|---|---|
| f-01 | stage | Flowering | Vegetative |
| f-02 | stage | Flowering | Vegetative |
| f-03 | pests | 2 sightings | 0 sightings |
| f-04 | plotHa | 2.4 | 2.0 |
| f-05 | pests | 11 sightings | 4 sightings |
| f-06 | notes | "CBD on two rows…" | the seed note |

An argument about merge semantics is not winnable in the abstract. A list of
six things somebody wrote down on a farm and the system threw away is.

Convergence itself is printed rather than asserted quietly: the page merges
the three replicas A→B→C and then C→B→A and shows both digests. If order
could change the answer, the two would differ.

---

## Layout

```
src/
  main.tsx    mounts App
  App.tsx     the two tabs; holds the device, the server and the log
  Field.tsx   the working record editor, the network control, the log
  Week.tsx    the replay, the convergence digests, the loss table
  crdt.ts     registers, counters, the merge, the wrong merge, the digest
  store.ts    the device, the outbox, persistence, the simulated wire
  week.ts     seven days on three devices, run under both rules
  data.ts     six farms, three officers, fourteen edits
  styles.css  tokens for both themes, then everything else
```

## Things worth knowing before changing it

**Why `localStorage` and not IndexedDB.** The real thing would use IndexedDB:
a week of records with photographs will pass the 5 MB ceiling, and a
synchronous write on the main thread is a frame drop in a form somebody is
typing into. This holds six records of text, and reaching for the
asynchronous store here would add a schema, a migration path and a
transaction wrapper to guard a limit this cannot approach. What is worth
copying is not the storage call — it is that persistence sits behind
`load`/`save` and nothing above knows which it is.

**Every storage call is wrapped.** A private window, a full quota, a
half-written value from a crash. The application works without storage; it
just forgets. Falling over there would be a worse outcome than forgetting.

**State is saved on change, not on unload.** A field worker closes the tab
by locking the phone, and `beforeunload` is not reliably delivered when that
happens.

**The whole-record digest is not flagged as a failure in the interface.** It
converges too. Marking it red would make the page argue the wrong thing: the
complaint is not that the rule is inconsistent, it is that the rule is
consistently wrong.

**The seed uses counter 0 and the actor `origin`.** Nothing in the seed can
outrank a real edit on a tiebreak, and a seeded value losing to a field
officer should not depend on how the device ids happen to sort.

**Lamport counters collide across devices on purpose.** Three replicas that
have never synced each count from 1, so the actor tiebreak gets exercised by
the replay rather than being dead code that has never run.

## Deploying

Vercel, as a static build — `npm run build` and the contents of `dist/`,
with no server-side anything. The three typefaces are self-hosted in
`public/fonts/` under the SIL Open Font Licence, included alongside them.
