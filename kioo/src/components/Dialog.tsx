import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * A modal, with the five things a modal needs and usually has two of.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *   1. Focus moves in when it opens.
 *   2. Focus cannot leave while it is open — Tab from the last focusable
 *      element wraps to the first, and Shift+Tab from the first wraps to
 *      the last.
 *   3. Escape closes it.
 *   4. The page behind does not scroll.
 *   5. Focus returns to whatever opened it.
 *
 * Miss (2) and a keyboard user tabs out of the dialog into a page they
 * cannot see and cannot get back from. Miss (5) and they are returned to
 * the top of the document every time they close anything.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ THE TRAP QUERIES ON EVERY TAB, NOT ONCE ON OPEN. A dialog's contents
 *   change — a field appears, a button becomes enabled — and a list of
 *   focusable elements captured at mount goes stale without anything
 *   looking wrong until somebody tries to reach the new control.
 *
 * `<dialog>` with `showModal()` would give (1) to (4) from the platform.
 * It is not used here because the backdrop cannot be styled from the token
 * layer in every browser this has to run in, and a modal whose scrim is
 * the wrong colour in one theme is the failure this whole system exists to
 * prevent. The trade is forty lines; it is written down so it can be
 * revisited when that stops being true.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Dialog = ({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    returnTo.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      returnTo.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="k-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="k-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={panelRef}
      >
        <header className="k-dialog__head">
          <h3>{title}</h3>
          <button type="button" className="k-dialog__x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="k-dialog__body">{children}</div>
        {footer && <footer className="k-dialog__foot">{footer}</footer>}
      </div>
    </div>
  );
};
