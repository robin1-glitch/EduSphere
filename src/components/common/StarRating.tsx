import { Star } from "lucide-react";

export function StarRating({ value, size = "md" }: { value: number; size?: "md" | "lg" }) {
  const rounded = Math.round(value);
  return (
    <span className={`community-stars${size === "lg" ? " community-stars--lg" : ""}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden="true" className={n <= rounded ? "" : "community-stars__empty"} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

/** Keyboard operable: native radio group (arrow keys move between stars). */
export function StarRatingInput({ name, value, onChange, error, describedBy }: { name: string; value: number; onChange: (v: number) => void; error?: string | undefined; describedBy?: string | undefined }) {
  return (
    <fieldset className="es-field" aria-describedby={describedBy}>
      <legend className="es-label">
        Rating<span className="es-label__req" aria-hidden="true">*</span>
        <span className="es-sr-only"> (required)</span>
      </legend>
      <div className="es-row">
        <div className="community-star-input" role="radiogroup" aria-invalid={Boolean(error) || undefined}>
          {[1, 2, 3, 4, 5].map((n) => {
            const id = `${name}-${n}`;
            return (
              <div key={n} className="community-star-input__option">
                <input type="radio" id={id} name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
                <label htmlFor={id} className={n <= value ? "is-on" : ""}>
                  <Star aria-hidden="true" fill="currentColor" strokeWidth={0} />
                  <span className="es-sr-only">{n} star{n === 1 ? "" : "s"}</span>
                </label>
              </div>
            );
          })}
        </div>
        <span className="community-star-input__text" aria-live="polite">
          {value ? `${value} out of 5` : "No rating selected"}
        </span>
      </div>
    </fieldset>
  );
}
