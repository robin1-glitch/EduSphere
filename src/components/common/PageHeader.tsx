import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow?: string; title: string; lead?: string; actions?: ReactNode }) {
  return (
    <header className="es-page-header">
      <div>
        {eyebrow ? <p className="es-eyebrow">{eyebrow}</p> : null}
        <h1 className="es-page-header__title">{title}</h1>
        {lead ? <p className="es-page-header__lead">{lead}</p> : null}
      </div>
      {actions ? <div className="es-row">{actions}</div> : null}
    </header>
  );
}
