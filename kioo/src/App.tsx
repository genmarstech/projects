import { useEffect, useState } from "react";

import { Audit } from "./Audit";
import { Foundations } from "./Foundations";
import { Gallery } from "./Gallery";
import { Callout, Tabs } from "./components";

type Choice = "system" | "light" | "dark";

/**
 * The theme control, and why it has three positions.
 *
 * ⚠ "SYSTEM" IS NOT "LIGHT". It is the absence of a choice, and it is what
 *   most people are in. A two-position toggle has to pick one of the two
 *   to mean "no preference", which silently overrides the operating system
 *   for everybody who never touched it.
 *
 * The choice is written as `data-theme` on the root. The token layer
 * assigns the dark values under that attribute as well as inside the media
 * query, so all three positions resolve to a complete set.
 */
const CHOICES: { id: Choice; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export const App = () => {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", choice);
  }, [choice]);

  return (
    <div className="shell">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="wordmark">Kioo</span>
          <span className="masthead__rule" aria-hidden="true" />
          <span className="masthead__sub">the Genmars design system</span>
        </div>

        <div className="masthead__row">
          <p className="k-lede masthead__lede">
            Four brand constants, a set of semantic tokens, eight
            components, and one rule the whole thing exists to enforce.
            Every contrast figure on this site is measured in your browser
            when the page loads.
          </p>

          <div className="theme" role="group" aria-label="Theme">
            {CHOICES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`theme__btn${choice === c.id ? " is-on" : ""}`}
                aria-pressed={choice === c.id}
                onClick={() => setChoice(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <Tabs
        label="Sections"
        tabs={[
          { id: "foundations", label: "Foundations", panel: <Foundations /> },
          { id: "components", label: "Components", panel: <Gallery /> },
          { id: "contrast", label: "Contrast", panel: <Audit /> },
          {
            id: "rules",
            label: "The rules",
            panel: (
              <div className="stack prose">
                <h3>Six rules, and what each one costs to break</h3>

                <Callout tone="bad" title="1 · A brand constant is never a background for semantic text">
                  Deep Well is #2e2b34 in both themes. <code>--ink</code> is
                  not. Put one on the other and a band of the page is
                  readable in one theme and invisible in the other — and
                  whoever built it was in the theme where it worked.
                </Callout>

                <Callout tone="warn" title="2 · State colours are not the accent">
                  The accent says Genmars. The four state tokens say
                  something about the data. A success chip in the brand
                  colour makes a claim the interface is not entitled to, and
                  leaves nothing to say success with on a screen where the
                  accent is already on the button beside it.
                </Callout>

                <Callout tone="info" title="3 · Tone is never the only signal">
                  Around one man in twelve cannot separate the red from the
                  green, and nobody can in a printed black-and-white report.
                  A chip carries its word; a callout carries a title. Colour
                  is how fast it reads, not whether it can be read.
                </Callout>

                <Callout tone="info" title="4 · Every control is reachable from a keyboard, and visibly focused">
                  One tab stop per tab strip, with arrows inside it. A modal
                  that traps focus and gives it back. A focus ring that
                  reaches 3:1 — which is why the light theme does not ring
                  in Ignition, at 2.64:1, and rings in{" "}
                  <code>--accent-text</code> instead.
                </Callout>

                <Callout tone="info" title="5 · Money is an integer of cents">
                  <code>0.1 + 0.2</code> is{" "}
                  <code>0.30000000000000004</code>. The component throws on
                  a fractional cent rather than rendering something
                  plausible and letting it travel further into the system.
                </Callout>

                <Callout tone="info" title="6 · Figures about the system are measured, not written down">
                  A design system that documents its contrast ratios in a
                  markdown file documents the ratios it had on the day
                  somebody typed them. The colours move; the file does not;
                  and the file is now a claim about accessibility that is
                  quietly false.
                </Callout>

                <h3>What this is not</h3>
                <p>
                  It is not a component library to install. It is a token
                  layer and eight worked examples, each carrying the reason
                  it is built the way it is — which is the part that
                  survives being copied into an application that needed a
                  ninth component.
                </p>
                <p>
                  The components are deliberately plain. A design system
                  earns its keep on the field that wires its own label, the
                  dialog that gives focus back and the chip that does not
                  borrow the brand colour — not on anything that looks
                  clever in a screenshot.
                </p>
              </div>
            ),
          },
        ]}
      />

      <footer className="foot">
        <p>
          A Genmars Tech project. The palette and the three typefaces are
          the ones <code>genmars.co.ke</code> uses; the rules are the ones
          its three frontends already enforce in CI. Self-hosted fonts under
          the SIL Open Font Licence.
        </p>
      </footer>
    </div>
  );
};
