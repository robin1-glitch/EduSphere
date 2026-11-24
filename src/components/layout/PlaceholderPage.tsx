import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { Card } from "@/components/common/Card";
import { buttonClass } from "@/components/common/Button";

export function PlaceholderPage({ title, module, children }: { title: string; module: string; children?: ReactNode }) {
  return (
    <div className="es-container es-page">
      <div className="es-placeholder es-stack">
        <Card className="es-state">
          <div className="es-state__icon" aria-hidden="true"><Construction /></div>
          <h1 className="es-page-header__title">{title}</h1>
          <p className="es-state__text">
            This page is built by another team member ({module} module). It will appear here inside the same layout.
          </p>
          <div className="es-state__action es-row">
            <Link to="/" className={buttonClass("secondary")}>Back to home</Link>
            <Link to="/community" className={buttonClass("primary")}>Visit the community</Link>
          </div>
        </Card>
        {children}
      </div>
    </div>
  );
}
