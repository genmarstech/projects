import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * A label, a control, a hint and an error — wired together.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE WIRING IS THE COMPONENT. THE BORDER IS NOT.
 *
 * Every field in every application needs: a `<label for>` pointing at the
 * control's id, `aria-describedby` pointing at the hint, `aria-invalid`
 * when it is wrong, and the error message *also* in `aria-describedby` so
 * it is read out rather than only seen.
 *
 * That is five relationships between four ids, and hand-wiring them is how
 * forms end up with labels that do not focus their input and errors a
 * screen reader never announces. `useId` generates the ids and the
 * component connects them, so the caller cannot get it wrong by omission.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⚠ THE ERROR REPLACES NOTHING. Hint and error are both rendered when both
 *   exist. A field whose hint disappears the moment it is wrong has taken
 *   away the instruction at the exact moment it was needed.
 */

type Common = {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
};

const useWiring = (hint: ReactNode, error: ReactNode) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  return { id, hintId, errorId, describedBy: describedBy || undefined };
};

const Shell = ({
  label,
  hint,
  error,
  required,
  id,
  hintId,
  errorId,
  children,
}: Common & { id: string; hintId: string; errorId: string; children: ReactNode }) => (
  <div className={`k-field${error ? " is-invalid" : ""}`}>
    <label className="k-field__label" htmlFor={id}>
      {label}
      {required && (
        <span className="k-field__req" title="Required">
          {/* The asterisk is decorative; the control carries `required`,
              which is what assistive technology actually reads. */}
          <span aria-hidden="true">*</span>
        </span>
      )}
    </label>
    {children}
    {hint && (
      <p className="k-field__hint" id={hintId}>
        {hint}
      </p>
    )}
    {error && (
      <p className="k-field__error" id={errorId}>
        {error}
      </p>
    )}
  </div>
);

export const TextField = ({
  label,
  hint,
  error,
  required,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) => {
  const w = useWiring(hint, error);
  return (
    <Shell label={label} hint={hint} error={error} required={required} {...w}>
      <input
        id={w.id}
        className="k-input"
        required={required}
        aria-describedby={w.describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Shell>
  );
};

export const TextArea = ({
  label,
  hint,
  error,
  required,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const w = useWiring(hint, error);
  return (
    <Shell label={label} hint={hint} error={error} required={required} {...w}>
      <textarea
        id={w.id}
        className="k-input k-input--area"
        required={required}
        aria-describedby={w.describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Shell>
  );
};

export const SelectField = ({
  label,
  hint,
  error,
  required,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) => {
  const w = useWiring(hint, error);
  return (
    <Shell label={label} hint={hint} error={error} required={required} {...w}>
      <select
        id={w.id}
        className="k-input k-input--select"
        required={required}
        aria-describedby={w.describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {children}
      </select>
    </Shell>
  );
};
