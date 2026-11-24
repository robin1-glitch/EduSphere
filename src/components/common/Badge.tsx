import type { ReactNode } from "react";
import { CheckCircle2, Clock, EyeOff, Lock, Pin, CircleDot } from "lucide-react";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";

export function Badge({ tone = "neutral", icon, children }: { tone?: BadgeTone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`es-badge${tone === "neutral" ? "" : ` es-badge--${tone}`}`}>
      {icon}
      {children}
    </span>
  );
}

/** Status badges always pair color with an icon and text. */
export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Open":
      return <Badge tone="success" icon={<CircleDot aria-hidden="true" />}>Open</Badge>;
    case "Locked":
      return <Badge tone="warning" icon={<Lock aria-hidden="true" />}>Locked</Badge>;
    case "Hidden":
      return <Badge tone="danger" icon={<EyeOff aria-hidden="true" />}>Hidden</Badge>;
    case "Approved":
      return <Badge tone="success" icon={<CheckCircle2 aria-hidden="true" />}>Approved</Badge>;
    case "Pending":
      return <Badge tone="warning" icon={<Clock aria-hidden="true" />}>Pending</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function PinnedBadge() {
  return <Badge tone="primary" icon={<Pin aria-hidden="true" />}>Pinned</Badge>;
}
