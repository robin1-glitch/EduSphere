import type { BadgeTone } from "@/components/common/Badge";

/** Category badges stay neutral/indigo; amber only for maintenance (a real status-like notice). */
export function announcementTone(category: string): BadgeTone {
  if (category === "Maintenance") return "warning";
  if (category === "Event") return "primary";
  return "neutral";
}
