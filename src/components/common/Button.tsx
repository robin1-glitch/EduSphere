import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";

export function buttonClass(variant: ButtonVariant = "primary", opts: { size?: "md" | "sm" | undefined; block?: boolean | undefined; extra?: string | undefined } = {}) {
  return [
    "es-btn",
    `es-btn--${variant}`,
    opts.size === "sm" ? "es-btn--sm" : "",
    opts.block ? "es-btn--block" : "",
    opts.extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant | undefined;
  size?: "md" | "sm" | undefined;
  block?: boolean | undefined;
  loading?: boolean | undefined;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", block, loading, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, { size, block, extra: className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
