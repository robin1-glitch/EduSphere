import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type Props = { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; label?: string };

export function Pagination({ page, pageSize, total, onPageChange, label = "results" }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="es-pagination" aria-label="Pagination">
      <p className="es-pagination__info" aria-live="polite">
        Showing {from}–{to} of {total} {label}
      </p>
      <div className="es-pagination__controls">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft aria-hidden="true" /> Previous
        </Button>
        <span className="es-pagination__page">
          Page {page} of {pages}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
          Next <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
