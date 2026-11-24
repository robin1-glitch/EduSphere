import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string | undefined; action?: ReactNode | undefined }) {
  return (
    <Card className="es-state">
      <div className="es-state__icon" aria-hidden="true">{icon ?? <Inbox />}</div>
      <h3 className="es-state__title">{title}</h3>
      {text ? <p className="es-state__text">{text}</p> : null}
      {action ? <div className="es-state__action">{action}</div> : null}
    </Card>
  );
}

export function ErrorState({ title = "Something went wrong", text = "We couldn't load this content. Check your connection and try again.", onRetry }: { title?: string; text?: string; onRetry?: () => void }) {
  return (
    <Card className="es-state es-state--error" role="alert">
      <div className="es-state__icon" aria-hidden="true"><AlertTriangle /></div>
      <h3 className="es-state__title">{title}</h3>
      <p className="es-state__text">{text}</p>
      {onRetry ? (
        <div className="es-state__action">
          <Button variant="secondary" onClick={onRetry}>Try again</Button>
        </div>
      ) : null}
    </Card>
  );
}

export function LoadingList({ count = 3, label = "Loading" }: { count?: number; label?: string }) {
  return (
    <div className="es-stack" role="status" aria-live="polite">
      <span className="es-sr-only">{label}…</span>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="community-skeleton-card" aria-hidden="true">
          <div className="es-skeleton es-skeleton--title" />
          <div className="es-skeleton es-skeleton--line" />
          <div className="es-skeleton es-skeleton--line es-skeleton--short" />
        </Card>
      ))}
    </div>
  );
}
