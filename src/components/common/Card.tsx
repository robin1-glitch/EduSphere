import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "article" | "section" | "li" | "aside";
  flush?: boolean;
  interactive?: boolean;
};

export function Card({ as: Tag = "div", flush, interactive, className, ...rest }: Props) {
  const cls = ["es-card", flush ? "es-card--flush" : "", interactive ? "es-card--interactive" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <Tag className={cls} {...rest} />;
}
