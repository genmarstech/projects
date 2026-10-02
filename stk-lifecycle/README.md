# Waiting for the Customer

An interactive teardown of the **M-Pesa STK push lifecycle** — what actually
happens between a cashier pressing *Charge* and money arriving, and why a till
must ask Safaricom rather than believe the callback.

Genmars R&D. Written from building a point-of-sale against the Daraja API.

```bash
npm install
npm run dev        # http://localhost:5173
npm run verify     # typecheck && build
```

## What it is

Two tills consume one event stream. **Till A** believes the callback. **Till B**
asks Safaricom on a schedule and treats a callback only as a hint that it is
worth asking early. Five scenarios play out on a shared clock, and the moment
the two tills disagree is a thing you watch happen rather than a paragraph
claiming it would.

Three of the five end in disagreement. One of those three is a theft.

| Scenario | Outcome |
|---|---|
| The customer pays | Both correct — which is why the mistake survives to production |
| The customer ignores the prompt | Both correct, after about a minute of silence |
| The callback never arrives | **Disagree** — A waits for ever on a paid sale |
| Somebody POSTs to the callback URL | **Disagree** — A opens the drawer for free |
| The money arrives after the till gave up | **Disagree** in kind, not in verdict |

## The argument

A till can learn the fate of a push two ways: wait to be told, or ask. They are
not equivalent, and the difference is not a preference.

The callback URL has to be public for Safaricom to reach it, so anybody can
reach it, and nothing in the body proves who sent it. It is also a single
delivery over the open internet to a box that sometimes restarts — when it is
lost, a till that waits waits for ever while the customer stands there holding
a phone that says Confirmed.

So the rule the production code ended up with is one line: **a callback never
decides anything.** It records that something happened and prompts an immediate
query, and only Safaricom's own answer moves a payment to paid. A forged
callback therefore costs one outbound query and achieves nothing, and the till
keeps working on the days the callback never arrives at all.

## It simulates; it never calls anything

Every event is generated locally on a timer. No request leaves the browser, no
credential exists in this repository, and there is no network code in it. The
payload shapes in "the wire" are the shapes a developer meets, trimmed.

Not affiliated with, endorsed by or connected to Safaricom. M-PESA and Daraja
are trademarks of their respective owners, used only to identify the API being
described.

## How it is built

Vite, React and TypeScript, with no other dependency. `src/lifecycle.ts` is the
whole model — scenarios as timed event lists, and a pure `frameAt(scenario, t)`
that recomputes both tills' beliefs from scratch at any instant.

That purity is load-bearing: scrubbing the timeline backwards gives the same
answer as playing forwards to the same point. A simulation whose history
depends on how you got there cannot be used to argue about anything.

## Design

Genmars' own palette — Deep Well, Canvas, Ignition — and the company's three
typefaces, Fraunces, IBM Plex Sans and Jost, vendored from `gen-website` under
the OFL. Deliberately **not** Safaricom green: this explains their API and is
not theirs, and dressing it in their colours would imply an endorsement nobody
gave. The only green is the one that means "paid", and it is a muted forest
that reads as a state rather than a brand.

Light and dark are both designed, driven by `prefers-color-scheme`.
