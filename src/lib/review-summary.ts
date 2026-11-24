import type { Review } from "@/lib/api/reviews";

export type ReviewSummary = { average: number; total: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> };

/** Summary is computed from approved reviews only. */
export function summarizeReviews(reviews: Pick<Review, "rating" | "status">[]): ReviewSummary {
  const approved = reviews.filter((r) => r.status === "Approved");
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
  let sum = 0;
  for (const r of approved) {
    const k = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[k] += 1;
    sum += r.rating;
  }
  const total = approved.length;
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, total, distribution };
}

/** Which reviews a viewer may see: admins see all; others see approved plus their own. */
export function visibleReviews<T extends Pick<Review, "status" | "author_name">>(
  reviews: T[],
  viewer: { name: string; role: string } | null,
) {
  if (viewer?.role === "admin") return reviews;
  return reviews.filter((r) => r.status === "Approved" || (viewer && r.author_name === viewer.name));
}
