import { Callout } from "./components";

const BRAND = [
  { token: "--deep-well", name: "Deep Well", hex: "#2e2b34", note: "Text, and the ground a dark surface sits on." },
  { token: "--canvas", name: "Canvas", hex: "#e9e3df", note: "The sunken surface in the light theme." },
  { token: "--ignition", name: "Ignition", hex: "#db7b51", note: "The accent. One per screen." },
  { token: "--paper", name: "Paper", hex: "#f4efec", note: "The light theme's page." },
];

const SEMANTIC = [
  ["--bg", "the page"],
  ["--bg-raised", "a card above it"],
  ["--bg-sunken", "a well below it"],
  ["--ink", "body copy"],
  ["--ink-muted", "secondary prose"],
  ["--ink-faint", "labels and metadata"],
  ["--accent", "the accent as a surface"],
  ["--accent-text", "the accent as words"],
  ["--rule", "a divider"],
  ["--rule-strong", "the edge of a control"],
];

const STATE = [
  ["--good", "--good-wash", "it worked, it is paid, it is live"],
  ["--warn", "--warn-wash", "look at this before you leave"],
  ["--bad", "--bad-wash", "it failed, it is overdue, it is wrong"],
  ["--info", "--info-wash", "a fact about the thing, with no judgement"],
];

const SCALE = [
  ["--text-2xl", "36.5px", "A page title, once"],
  ["--text-xl", "29px", "A section"],
  ["--text-lg", "23.5px", "A panel heading"],
  ["--text-md", "18.75px", "A card heading"],
  ["--text-base", "15px", "Everything somebody reads"],
  ["--text-sm", "12.5px", "Secondary, inside dense furniture"],
  ["--text-xs", "11px", "A label. Uppercase, tracked"],
];

const SPACE = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-5", "--space-6", "--space-7", "--space-8"];

export const Foundations = () => (
  <div className="stack">
    <section>
      <h3>Brand constants</h3>
      <p className="k-lede">
        Fixed. These four are the company&rsquo;s colours and they do not
        respond to the theme, the surface, or anything else. They appear
        exactly once in the codebase — in the derivation of the semantic
        tokens — and nothing outside the token layer may name one.
      </p>
      <ul className="swatches">
        {BRAND.map((c) => (
          <li key={c.token}>
            <span className="swatches__chip" style={{ background: c.hex }} aria-hidden="true" />
            <strong>{c.name}</strong>
            <code>{c.token}</code>
            <span className="swatches__hex">{c.hex}</span>
            <span className="swatches__note">{c.note}</span>
          </li>
        ))}
      </ul>

      <Callout tone="bad" title="The failure this separation exists to prevent">
        A brand constant used as a background while the text on it uses a
        semantic token produces a light band with light text in one of the
        two themes. That has shipped. It is why{" "}
        <code>check-theme-tokens.mjs</code> runs in every Genmars frontend,
        and why the contrast figures on this site are measured rather than
        written down.
      </Callout>
    </section>

    <section>
      <h3>Semantic tokens</h3>
      <p className="k-lede">
        Roles, not colours. Each has a different value in each theme, and a
        component names the role.
      </p>
      <ul className="tokens">
        {SEMANTIC.map(([token, use]) => (
          <li key={token}>
            <span className="tokens__dot" style={{ background: `var(${token})` }} aria-hidden="true" />
            <code>{token}</code>
            <span>{use}</span>
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h3>State, which is never the accent</h3>
      <p className="k-lede">
        A success chip wearing the brand colour means a brand-coloured thing
        is a successful thing — a claim the interface is not entitled to
        make. It also leaves nothing to say success with, on a screen where
        the brand colour is already on the button beside it.
      </p>
      <ul className="tokens">
        {STATE.map(([token, wash, use]) => (
          <li key={token}>
            <span
              className="tokens__dot tokens__dot--state"
              style={{ background: `var(${wash})`, borderColor: `var(${token})` }}
              aria-hidden="true"
            />
            <code>{token}</code>
            <span>{use}</span>
          </li>
        ))}
      </ul>
    </section>

    <section>
      <h3>Type</h3>
      <p className="k-lede">
        A major third (1.25) from a 15px body, so a new size is a step on a
        scale rather than a negotiation. The two smallest are off the ratio:
        below 13px, legibility decides rather than proportion.
      </p>
      <ul className="scale">
        {SCALE.map(([token, px, use]) => (
          <li key={token}>
            <span className="scale__sample" style={{ fontSize: `var(${token})` }}>
              Kazi nzuri
            </span>
            <code>{token}</code>
            <span className="scale__px">{px}</span>
            <span className="scale__use">{use}</span>
          </li>
        ))}
      </ul>
      <p className="k-note">
        Three faces, each with a job. <strong>Fraunces</strong> for display
        and anything editorial, <strong>IBM Plex Sans</strong> for
        everything somebody reads at length, <strong>Jost</strong> for the
        wordmark and nothing else. Long-form text is capped at{" "}
        <code>--measure</code>, which is 68 characters.
      </p>
    </section>

    <section>
      <h3>Space</h3>
      <p className="k-lede">
        A 4px grid, and nothing between the steps. A gap of 13px is not a
        decision, it is an accident, and the only way to keep them out is
        to have no token for them.
      </p>
      <ul className="spaces">
        {SPACE.map((token) => (
          <li key={token}>
            <span className="spaces__bar" style={{ width: `var(${token})` }} aria-hidden="true" />
            <code>{token}</code>
          </li>
        ))}
      </ul>
    </section>
  </div>
);
