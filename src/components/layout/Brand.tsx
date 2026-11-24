import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" className="es-brand" aria-label="EduSphere home" onClick={onNavigate}>
      <span className="es-brand__mark" aria-hidden="true">
        <GraduationCap />
      </span>
      EduSphere
    </Link>
  );
}
