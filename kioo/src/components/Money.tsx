/**
 * Money, which is not a number.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE AMOUNT IS AN INTEGER OF CENTS, AND THE COMPONENT WILL NOT TAKE A FLOAT.
 *
 * `0.1 + 0.2` is `0.30000000000000004`, and a till that adds three hundred
 * line items in floating point is a till whose total is wrong by a cent
 * some of the time. Which is not a rounding question — it is a receipt
 * that does not reconcile, found by an accountant weeks later.
 *
 * So the type is `cents: number` and the component throws on a value that
 * is not an integer. Throwing is the point: the alternative is rendering
 * something plausible and letting the fractional cent travel further into
 * the system.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ NEGATIVE AMOUNTS ARE NOT RED BY DEFAULT.
 *
 *   A refund is negative and perfectly fine; an overdraft is negative and
 *   is not. The component does not know which, so the caller says with
 *   `tone`. Colouring every minus sign red teaches people to ignore it.
 */

export const formatKes = (cents: number, showCents = false): string => {
  if (!Number.isInteger(cents)) {
    throw new Error(
      `Money takes an integer number of cents. Got ${cents} — a fractional cent means a float got in upstream.`,
    );
  }
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const part = abs % 100;

  const body = showCents || part !== 0
    ? `${whole.toLocaleString("en-KE")}.${String(part).padStart(2, "0")}`
    : whole.toLocaleString("en-KE");

  return `${negative ? "−" : ""}KSh ${body}`;
};

export const Money = ({
  cents,
  showCents = false,
  tone = "plain",
}: {
  cents: number;
  showCents?: boolean;
  tone?: "plain" | "good" | "bad" | "muted";
}) => (
  /*
   * `tabular-nums` is not decoration here. A column of amounts in
   * proportional figures does not line up at the decimal point, and a
   * reader comparing two totals is comparing their widths before they
   * read either.
   */
  <span className={`k-money k-money--${tone}`}>{formatKes(cents, showCents)}</span>
);
