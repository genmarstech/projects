import { useState } from "react";

import {
  Button,
  Callout,
  Chip,
  type ColumnSpec,
  DataTable,
  Dialog,
  Empty,
  Money,
  SelectField,
  Tabs,
  TextArea,
  TextField,
} from "./components";

type Invoice = { ref: string; client: string; cents: number; state: "paid" | "due" | "overdue" };

const INVOICES: Invoice[] = [
  { ref: "INV-2026-041", client: "Riverside Dental", cents: 185_000_00, state: "paid" },
  { ref: "INV-2026-042", client: "Kilimani Coffee", cents: 42_500_00, state: "due" },
  { ref: "INV-2026-043", client: "Mwangi & Sons Hardware", cents: 9_800_00, state: "overdue" },
  { ref: "INV-2026-044", client: "Lakeview Lodge", cents: 268_400_00, state: "due" },
  { ref: "CRN-2026-007", client: "Kilimani Coffee", cents: -12_000_00, state: "paid" },
];

const COLUMNS: ColumnSpec<Invoice>[] = [
  { key: "ref", header: "Reference", render: (r) => <code>{r.ref}</code>, width: "9rem" },
  { key: "client", header: "Client", render: (r) => r.client },
  {
    key: "amount",
    header: "Amount",
    align: "num",
    render: (r) => <Money cents={r.cents} tone={r.cents < 0 ? "muted" : "plain"} />,
  },
  {
    key: "state",
    header: "State",
    render: (r) => (
      <Chip tone={r.state === "paid" ? "good" : r.state === "due" ? "info" : "bad"}>
        {r.state}
      </Chip>
    ),
  },
];

export const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("42500");
  const bad = amount !== "" && !/^\d+$/.test(amount);

  return (
    <div className="stack">
      <section>
        <h3>Buttons</h3>
        <p className="k-lede">
          At most one primary on a view. A screen with three has not decided
          what it is for. <code>danger</code> is a promise that the action
          destroys something, not a way to say &ldquo;important&rdquo;.
        </p>
        <div className="row">
          <Button variant="primary">Record payment</Button>
          <Button>Save draft</Button>
          <Button variant="quiet">Cancel</Button>
          <Button variant="danger">Void invoice</Button>
          <Button variant="primary" disabled>
            Unavailable
          </Button>
          <Button
            variant="primary"
            busy={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => setBusy(false), 1400);
            }}
          >
            {busy ? "Sending" : "Send to client"}
          </Button>
        </div>
        <div className="row">
          <Button size="sm">Small</Button>
          <Button size="sm" variant="primary">
            Small primary
          </Button>
        </div>
      </section>

      <section>
        <h3>Fields</h3>
        <p className="k-lede">
          The wiring is the component. A label pointing at the control, the
          hint and the error both in <code>aria-describedby</code>, and{" "}
          <code>aria-invalid</code> when it is wrong — five relationships
          between four generated ids, so a caller cannot get them wrong by
          omission.
        </p>
        <div className="grid2">
          <TextField
            label="Client"
            hint="As it should appear on the invoice."
            defaultValue="Kilimani Coffee"
            required
          />
          <TextField
            label="Amount, in shillings"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="Whole shillings. Cents are added at the till."
            error={bad ? "Digits only — the field is a whole number of shillings." : undefined}
          />
          <SelectField label="Terms" hint="When payment falls due." defaultValue="30">
            <option value="0">On receipt</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </SelectField>
          <TextArea label="Note on the invoice" rows={3} placeholder="Optional." />
        </div>
        <p className="k-note">
          The hint stays when the error appears. A field whose instruction
          disappears the moment it is wrong has taken the instruction away
          at the exact moment it was needed.
        </p>
      </section>

      <section>
        <h3>Chips and callouts</h3>
        <p className="k-lede">
          Tone is never the only signal. Around one man in twelve cannot
          separate the red from the green, and nobody at all can in a
          printed black-and-white report — so a chip carries its word and a
          callout carries a title.
        </p>
        <div className="row">
          <Chip>draft</Chip>
          <Chip tone="good">paid</Chip>
          <Chip tone="info">due in 14 days</Chip>
          <Chip tone="warn">awaiting approval</Chip>
          <Chip tone="bad">overdue</Chip>
        </div>
        <div className="stack stack--tight">
          <Callout tone="info" title="Saving is not publishing">
            A document is included in the next website build. The deploy
            after that is what puts it on the internet.
          </Callout>
          <Callout tone="warn" title="This client has no permission on file">
            The item will not appear publicly until written consent is
            recorded, however firmly the tick box is ticked.
          </Callout>
          <Callout tone="bad" title="The callback cannot be trusted">
            A till learns the fate of a push by asking, not by being told.
          </Callout>
        </div>
      </section>

      <section>
        <h3>Money</h3>
        <p className="k-lede">
          An integer number of cents, and the component throws on anything
          else. <code>0.1 + 0.2</code> is <code>0.30000000000000004</code>,
          and a till that adds three hundred lines in floating point
          produces a receipt that does not reconcile — found by an
          accountant, weeks later.
        </p>
        <div className="row row--money">
          <Money cents={18_500_000} />
          <Money cents={4_250_000} showCents />
          <Money cents={-1_200_000} tone="muted" />
          <Money cents={99} showCents />
          <Money cents={268_400_00} tone="good" />
        </div>
        <p className="k-note">
          Negative is not red by default. A refund is negative and perfectly
          fine; an overdraft is negative and is not. The component cannot
          tell, so the caller says.
        </p>
      </section>

      <section>
        <h3>Tables</h3>
        <p className="k-lede">
          A caption a screen reader can announce, numeric columns in tabular
          figures and right-aligned together, a required empty state, and a
          sticky header that sticks to its own scroll container rather than
          to the page.
        </p>
        <DataTable
          caption="Invoices, with their state"
          columns={COLUMNS}
          rows={INVOICES}
          rowKey={(r) => r.ref}
          empty="No invoices yet."
        />
        <div className="k-panel">
          <Empty title="Nothing matched that search">
            Three filters are applied. Clearing the date range usually helps.
          </Empty>
        </div>
      </section>

      <section>
        <h3>Tabs</h3>
        <p className="k-lede">
          One tab stop for the whole strip, with the arrow keys moving
          inside it — the roving tabindex pattern. Five buttons would be
          five stops on the way past, which is invisible to anybody using a
          mouse and is why it survives in so many libraries.
        </p>
        <Tabs
          label="An example strip"
          tabs={[
            { id: "a", label: "Overview", panel: <p>Try the arrow keys, Home and End.</p> },
            { id: "b", label: "Lines", panel: <p>Selection follows focus, which is right when switching is cheap.</p> },
            { id: "c", label: "History", panel: <p>Where a tab triggers a request, it should not — and this component would need a manual mode rather than a comment saying so.</p> },
          ]}
        />
      </section>

      <section>
        <h3>Dialog</h3>
        <p className="k-lede">
          Focus moves in, cannot leave, Escape closes, the page behind does
          not scroll, and focus returns to whatever opened it. Open this one
          with the keyboard and try to Tab out of it.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Void INV-2026-043
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Void this invoice?"
          footer={
            <>
              <Button variant="quiet" onClick={() => setOpen(false)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Void it
              </Button>
            </>
          }
        >
          <p>
            INV-2026-043 to Mwangi &amp; Sons Hardware, <Money cents={9_800_00} />.
          </p>
          <TextField label="Reason" hint="Recorded against the invoice and shown to the client." />
        </Dialog>
      </section>
    </div>
  );
};
