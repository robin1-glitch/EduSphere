import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

type FieldProps = {
  label: string;
  error?: string | undefined;
  help?: string | undefined;
  required?: boolean | undefined;
  counter?: string | undefined;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/** Visible label + control + help/validation text, wired with aria attributes. */
export function FormField({ label, error, help, required, counter, children }: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errId = `${id}-error`;
  const describedBy = [error ? errId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="es-field">
      <label htmlFor={id} className="es-label">
        {label}
        {required ? <span className="es-label__req" aria-hidden="true">*</span> : null}
        {required ? <span className="es-sr-only"> (required)</span> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error || help || counter ? (
        <div className="es-field__foot">
          <div>
            {error ? (
              <p id={errId} className="es-error">
                <AlertCircle aria-hidden="true" />
                {error}
              </p>
            ) : help ? (
              <p id={helpId} className="es-help">{help}</p>
            ) : null}
          </div>
          {counter ? <span className="es-help" aria-hidden="true">{counter}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

type Common = { label: string; error?: string | undefined; help?: string | undefined; required?: boolean | undefined };

export function TextField({ label, error, help, required, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField label={label} error={error} help={help} required={required}>
      {({ id, describedBy, invalid }) => (
        <input id={id} className="es-input" aria-invalid={invalid || undefined} aria-describedby={describedBy} aria-required={required || undefined} {...rest} />
      )}
    </FormField>
  );
}

export function SelectField({ label, error, help, required, options, placeholder, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; placeholder?: string | undefined }) {
  return (
    <FormField label={label} error={error} help={help} required={required}>
      {({ id, describedBy, invalid }) => (
        <select id={id} className="es-select" aria-invalid={invalid || undefined} aria-describedby={describedBy} aria-required={required || undefined} {...rest}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
    </FormField>
  );
}

export function TextAreaField({ label, error, help, required, maxLength, value, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const len = typeof value === "string" ? value.length : 0;
  return (
    <FormField label={label} error={error} help={help} required={required} counter={maxLength ? `${len}/${maxLength}` : undefined}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} className="es-textarea" aria-invalid={invalid || undefined} aria-describedby={describedBy} aria-required={required || undefined} maxLength={maxLength} value={value} {...rest} />
      )}
    </FormField>
  );
}
