import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * ── FOUR VARIANTS, AND A RULE ABOUT HOW MANY APPEAR AT ONCE ───────────────
 *
 * `primary` is the one thing this screen is for. There is at most one on a
 * view, and a screen with three primary buttons has not decided what it is
 * for. `secondary` is everything else somebody might do, `quiet` is for
 * actions that sit inside dense furniture like a table row, and `danger` is
 * for the one that cannot be undone.
 *
 * ⚠ `danger` IS NOT A COLOUR, IT IS A PROMISE. It says the action destroys
 *   something. Using it to mean "important" spends the only signal the
 *   interface has for "you will not get this back".
 */

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "sm" | "md";
  busy?: boolean;
  children: ReactNode;
};

export const Button = ({
  variant = "secondary",
  size = "md",
  busy = false,
  disabled,
  children,
  className = "",
  ...rest
}: Props) => (
  <button
    type="button"
    className={`k-btn k-btn--${variant} k-btn--${size}${busy ? " is-busy" : ""} ${className}`.trim()}
    /*
     * Busy disables, and `aria-busy` says why.
     *
     * A button that looks disabled with no explanation is indistinguishable
     * from a button that is broken. A screen reader gets the state; a
     * sighted reader gets the spinner; both are told the same thing.
     */
    disabled={disabled || busy}
    aria-busy={busy || undefined}
    {...rest}
  >
    {busy && <span className="k-btn__spin" aria-hidden="true" />}
    {children}
  </button>
);
