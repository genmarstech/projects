import type { ReactNode } from "react";

/**
 * Chips and callouts — the two ways this system says something is true of
 * something else.
 *
 * ⚠ TONE IS NEVER THE ONLY SIGNAL.
 *
 *   Around one man in twelve cannot separate the red from the green here,
 *   and nobody at all can see either in a printed black-and-white report.
 *   So a chip carries its word, and a callout carries a title. The colour
 *   is how fast it is read, not whether it can be.
 *
 * The four tones are the state tokens, never the accent. See the note on
 * `--good` in `tokens.css`: a success chip wearing the brand colour makes
 * a claim the interface is not entitled to make.
 */

export type Tone = "neutral" | "good" | "warn" | "bad" | "info";

export const Chip = ({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) => (
  <span className={`k-chip k-chip--${tone}`}>{children}</span>
);

export const Callout = ({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
}) => (
  <aside className={`k-callout k-callout--${tone}`}>
    <h4 className="k-callout__title">{title}</h4>
    {children && <div className="k-callout__body">{children}</div>}
  </aside>
);

/**
 * What to show where there is nothing.
 *
 * An empty table with a header and no rows tells a reader the application
 * is broken. This says which of the three it is — nothing yet, nothing
 * matched, or nothing you may see — and offers the way out.
 */
export const Empty = ({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) => (
  <div className="k-empty">
    <p className="k-empty__title">{title}</p>
    {children && <p className="k-empty__body">{children}</p>}
    {action}
  </div>
);
