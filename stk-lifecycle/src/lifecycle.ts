/**
 * What actually happens between a cashier pressing Charge and money arriving.
 *
 * ── THIS SIMULATES; IT NEVER CALLS ANYTHING ────────────────────────────────
 *
 * Every event below is generated locally on a timer. No request leaves the
 * browser, no credential exists in this repository, and nothing here is
 * affiliated with or endorsed by Safaricom. It is a teardown of a public API
 * written from the experience of shipping a till against it.
 *
 * ── THE ARGUMENT THE WHOLE THING EXISTS TO MAKE ────────────────────────────
 *
 * A till can learn the fate of a push two ways: wait to be told (the
 * callback), or ask (the query API). They are not equivalent, and the
 * difference is not a preference.
 *
 * The callback URL is public — Safaricom has to reach it, so anybody can. A
 * till that believes it will open its drawer for a forged POST. And the
 * callback is a single delivery over the public internet to a box that
 * sometimes restarts: when it is lost, a till that waits waits for ever,
 * while the customer stands there holding a phone that says Confirmed.
 *
 * So: the query is the source of truth and the callback is a hint that it is
 * worth asking early. Three of the five scenarios below diverge on exactly
 * that, and one of the three is a theft.
 */

export type Strategy = "callback" | "query";

/** Where a push actually is, as far as Safaricom is concerned. */
export type Truth = "pending" | "paid" | "failed" | "expired";

/** What a till believes. `unknown` is a real answer and the honest one. */
export type Belief = "waiting" | "paid" | "failed" | "expired" | "unknown";

export type Actor = "till" | "daraja" | "customer" | "attacker";

export type WireEvent = {
  at: number; // seconds since the cashier pressed Charge
  from: Actor;
  to: Actor;
  label: string;
  /** The payload shape a developer would actually see. Trimmed, not invented. */
  payload?: Record<string, unknown>;
  /** What this event does to the truth, if anything. */
  settles?: Truth;
  /** A callback POST landing on our public URL. */
  callback?: { claims: Truth; forged?: boolean };
  note?: string;
};

export type Scenario = {
  slug: string;
  title: string;
  /** One line on the card. */
  blurb: string;
  /** Why this one is in the set. */
  why: string;
  /** How often a till meets this. Honest words, never a percentage we
   *  have not measured. */
  frequency: string;
  events: WireEvent[];
  /** The last moment the cashier can still be standing there. */
  tillTimeout: number;
  /** Said plainly once the run finishes. */
  verdict: { callback: string; query: string };
};

/** Result codes a till actually sees. Not the full catalogue. */
export const RESULT_CODES: { code: string; meaning: string; note?: string }[] = [
  { code: "0", meaning: "Success" },
  { code: "1", meaning: "Insufficient balance" },
  { code: "1032", meaning: "Cancelled by the customer" },
  {
    code: "1037",
    meaning: "No response from the phone",
    note: "Prompt never answered, or the handset was unreachable.",
  },
  { code: "2001", meaning: "Wrong PIN" },
  { code: "1019", meaning: "Transaction expired" },
  {
    code: "500.001.1001",
    meaning: "Still being processed",
    note: "Returned by the QUERY while the customer is still deciding. It is an error shape carrying a non-error meaning, and reading it as failure is the single most common way a working integration reports a false decline.",
  },
];

const ACCEPTED: WireEvent = {
  at: 0.6,
  from: "daraja",
  to: "till",
  label: "Accepted for processing",
  payload: {
    MerchantRequestID: "29115-34620561-1",
    CheckoutRequestID: "ws_CO_191220191020363925",
    ResponseCode: "0",
    ResponseDescription: "Success. Request accepted for processing",
    CustomerMessage: "Success. Request accepted for processing",
  },
  note: 'ResponseCode 0 here means ACCEPTED, not paid. It is the first trap: the word is "Success" and nobody has paid anything yet.',
};

const PUSH: WireEvent = {
  at: 0,
  from: "till",
  to: "daraja",
  label: "STK push",
  payload: {
    BusinessShortCode: "174379",
    TransactionType: "CustomerPayBillOnline",
    Amount: 1450,
    PartyA: "2547XXXXXXXX",
    CallBackURL: "https://till.example.co.ke/pay/mpesa/callback/<token>",
    AccountReference: "SALE-4471",
  },
  note: "The callback URL carries a per-push token. It has to be public for Safaricom to reach it, which is the whole problem.",
};

const PROMPT: WireEvent = {
  at: 1.4,
  from: "daraja",
  to: "customer",
  label: "Prompt appears on the handset",
};

export const SCENARIOS: Scenario[] = [
  {
    slug: "happy",
    title: "The customer pays",
    blurb: "PIN entered at eight seconds. Everything works.",
    why: "The path every integration is tested against, and the only one most are tested against.",
    frequency: "Most of the time.",
    tillTimeout: 90,
    events: [
      PUSH,
      ACCEPTED,
      PROMPT,
      { at: 8, from: "customer", to: "daraja", label: "PIN entered", settles: "paid" },
      {
        at: 9.5,
        from: "daraja",
        to: "till",
        label: "Callback: paid",
        callback: { claims: "paid" },
        payload: {
          Body: {
            stkCallback: {
              CheckoutRequestID: "ws_CO_191220191020363925",
              ResultCode: 0,
              ResultDesc: "The service request is processed successfully.",
              CallbackMetadata: {
                Item: [
                  { Name: "Amount", Value: 1450 },
                  { Name: "MpesaReceiptNumber", Value: "SFE4R2K9QL" },
                  { Name: "TransactionDate", Value: 20261002142233 },
                ],
              },
            },
          },
        },
      },
    ],
    verdict: {
      callback: "Correct, and this is why the mistake survives to production.",
      query: "Correct, one extra outbound request.",
    },
  },
  {
    slug: "ignored",
    title: "The customer ignores the prompt",
    blurb: "No PIN. Safaricom gives up before the cashier does.",
    why: "The commonest non-payment, and the one the queue behind the counter notices.",
    frequency: "Several times a day in a busy shop.",
    tillTimeout: 90,
    events: [
      PUSH,
      ACCEPTED,
      PROMPT,
      {
        at: 62,
        from: "daraja",
        to: "till",
        label: "Callback: no response",
        settles: "expired",
        callback: { claims: "expired" },
        payload: {
          Body: {
            stkCallback: {
              ResultCode: 1037,
              ResultDesc: "DS timeout. User cannot be reached",
            },
          },
        },
        note: "About a minute of a cashier, a customer and a queue all waiting. The till should say so while it waits, not freeze.",
      },
    ],
    verdict: {
      callback: "Correct, eventually. A minute of silence first.",
      query: "Correct, and able to say 'still waiting' every few seconds meanwhile.",
    },
  },
  {
    slug: "lost-callback",
    title: "The callback never arrives",
    blurb: "The customer paid. The POST never lands.",
    why: "A redeploy, a dropped connection, a NAT that closed, a 502 from our own proxy. One delivery, over the public internet, to a box that sometimes restarts.",
    frequency: "Rare per push; routine across a month of them.",
    tillTimeout: 90,
    events: [
      PUSH,
      ACCEPTED,
      PROMPT,
      {
        at: 11,
        from: "customer",
        to: "daraja",
        label: "PIN entered",
        settles: "paid",
        note: "The customer's phone says Confirmed. They are showing it to the cashier.",
      },
      {
        at: 12.5,
        from: "daraja",
        to: "till",
        label: "Callback lost in transit",
        note: "Sent, never received. Nothing in our logs records a thing that did not arrive.",
      },
    ],
    verdict: {
      callback: "WRONG. Waits for ever on a sale already paid for, while the customer holds up a confirmation SMS.",
      query: "Paid at the next poll. The customer leaves with their shopping.",
    },
  },
  {
    slug: "forged",
    title: "Somebody POSTs to the callback URL",
    blurb: "No payment. A till that trusts the callback opens the drawer.",
    why: "The URL is public by necessity — Safaricom must reach it. Anything that can reach it can post to it.",
    frequency: "Never, until once.",
    tillTimeout: 90,
    events: [
      PUSH,
      ACCEPTED,
      PROMPT,
      {
        at: 6,
        from: "attacker",
        to: "till",
        label: "Forged callback: paid",
        callback: { claims: "paid", forged: true },
        payload: {
          Body: {
            stkCallback: {
              ResultCode: 0,
              ResultDesc: "The service request is processed successfully.",
              CallbackMetadata: { Item: [{ Name: "Amount", Value: 1450 }] },
            },
          },
        },
        note: "Well-formed, plausible, and entirely invented. Nothing in the body proves who sent it.",
      },
    ],
    verdict: {
      callback: "THEFT. Marks the sale paid and prints a receipt for money nobody sent.",
      query: "Costs one outbound query and achieves nothing. The answer is still 'pending'.",
    },
  },
  {
    slug: "late",
    title: "The money arrives after the till gave up",
    blurb: "PIN at seventy seconds, on a sale the cashier already voided.",
    why: "The cashier cannot wait for ever and the customer is slow. Both are behaving reasonably; the sale is void and the money is real.",
    frequency: "Often enough to need a rule.",
    tillTimeout: 60,
    events: [
      PUSH,
      ACCEPTED,
      PROMPT,
      {
        at: 60,
        from: "till",
        to: "till",
        label: "Cashier gives up, voids the sale",
        note: "The queue is five deep. This is the right call at the counter.",
      },
      {
        at: 70,
        from: "customer",
        to: "daraja",
        label: "PIN entered",
        settles: "paid",
        note: "Found their phone. Money has now moved against a sale that no longer exists.",
      },
      {
        at: 71,
        from: "daraja",
        to: "till",
        label: "Callback: paid",
        callback: { claims: "paid" },
      },
    ],
    verdict: {
      callback: "Marks a voided sale paid. Now the receipt and the drawer disagree.",
      query: "Same money, same problem — but the push is still a row with an amount and a receipt number, so it can be refunded or applied deliberately rather than discovered at close of day.",
    },
  },
];

// ── running one ─────────────────────────────────────────────────────────────

export type Frame = {
  t: number;
  truth: Truth;
  /** What each till believes at this instant. */
  belief: Record<Strategy, Belief>;
  /** Events that have happened by now. */
  seen: WireEvent[];
  /** Query polls the querying till has made. */
  polls: { at: number; answer: Truth }[];
  /** True once the two tills disagree. */
  diverged: boolean;
};

export const POLL_EVERY = 5;

function truthAt(scenario: Scenario, t: number): Truth {
  let truth: Truth = "pending";
  for (const e of scenario.events) {
    if (e.at <= t && e.settles) truth = e.settles;
  }
  return truth;
}

function asBelief(truth: Truth): Belief {
  return truth === "pending" ? "waiting" : truth;
}

/**
 * The state of both tills at time `t`.
 *
 * Recomputed from the event list rather than accumulated, so scrubbing the
 * timeline backwards gives the same answer as playing forwards to the same
 * point. A simulation whose history depends on how you got there cannot be
 * used to argue about anything.
 */
export function frameAt(scenario: Scenario, t: number): Frame {
  const seen = scenario.events.filter((e) => e.at <= t);
  const truth = truthAt(scenario, t);

  // The callback-trusting till. It believes the last callback it received,
  // whoever sent it, and otherwise believes nothing has happened.
  let callbackBelief: Belief = "waiting";
  for (const e of seen) {
    if (e.callback) callbackBelief = asBelief(e.callback.claims);
  }

  // The querying till. It asks on a schedule, and a callback only makes it
  // ask sooner. Safaricom's answer is the only thing that moves it.
  const polls: { at: number; answer: Truth }[] = [];
  for (let at = POLL_EVERY; at <= Math.min(t, scenario.tillTimeout); at += POLL_EVERY) {
    polls.push({ at, answer: truthAt(scenario, at) });
  }
  for (const e of seen) {
    // A callback is a hint: ask immediately rather than wait for the tick.
    if (e.callback) {
      const at = Math.min(e.at + 0.3, t);
      polls.push({ at, answer: truthAt(scenario, at) });
    }
  }
  polls.sort((a, b) => a.at - b.at);

  let queryBelief: Belief = "waiting";
  for (const p of polls) {
    if (p.answer !== "pending") queryBelief = asBelief(p.answer);
  }

  // Past the till timeout, a waiting cashier has no answer. Saying "unknown"
  // is the honest state and the one a receipt must never be printed from.
  if (t >= scenario.tillTimeout) {
    if (callbackBelief === "waiting") callbackBelief = "unknown";
    if (queryBelief === "waiting") queryBelief = "unknown";
  }

  return {
    t,
    truth,
    belief: { callback: callbackBelief, query: queryBelief },
    seen,
    polls,
    diverged: callbackBelief !== queryBelief,
  };
}

/** The furthest the clock needs to run for this scenario to be over. */
export function runLength(scenario: Scenario): number {
  const last = scenario.events.reduce((m, e) => Math.max(m, e.at), 0);
  return Math.max(last, scenario.tillTimeout) + 6;
}
