/** Shared form rules. Each validator returns an error message or null. */
export const LIMITS = {
  postTitle: { min: 5, max: 150 },
  postContent: { min: 10, max: 5000 },
  reply: { min: 2, max: 3000 },
  reviewComment: { min: 10, max: 2000 },
  announcementTitle: { min: 5, max: 150 },
  announcementBody: { min: 10, max: 5000 },
  contactName: { min: 2, max: 100 },
  contactMessage: { min: 20, max: 2000 },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value: string, label: string) {
  return value.trim() ? null : `${label} is required.`;
}

export function lengthBetween(value: string, label: string, min: number, max: number) {
  const len = value.trim().length;
  if (!len) return `${label} is required.`;
  if (len < min) return `${label} must be at least ${min} characters.`;
  if (len > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function email(value: string) {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (v.length > 255 || !EMAIL_RE.test(v)) return "Enter a valid email address, like name@example.com.";
  return null;
}

export function rating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5 ? null : "Choose a rating from 1 to 5 stars.";
}

export type Errors<T extends string> = Partial<Record<T, string>>;

export function collect<T extends string>(checks: Record<T, string | null>): Errors<T> {
  const out: Errors<T> = {};
  for (const key of Object.keys(checks) as T[]) {
    const msg = checks[key];
    if (msg) out[key] = msg;
  }
  return out;
}

export function hasErrors(e: Record<string, string | undefined>) {
  return Object.values(e).some(Boolean);
}

export function validateContact(v: { name: string; email: string; subject: string; message: string }) {
  return collect({
    name: lengthBetween(v.name, "Full name", LIMITS.contactName.min, LIMITS.contactName.max),
    email: email(v.email),
    subject: required(v.subject, "Subject"),
    message: lengthBetween(v.message, "Message", LIMITS.contactMessage.min, LIMITS.contactMessage.max),
  });
}

export function validatePost(v: { title: string; category: string; content: string }) {
  return collect({
    title: lengthBetween(v.title, "Title", LIMITS.postTitle.min, LIMITS.postTitle.max),
    category: required(v.category, "Category"),
    content: lengthBetween(v.content, "Content", LIMITS.postContent.min, LIMITS.postContent.max),
  });
}

export function validateReview(v: { courseName: string; rating: number; comment: string }) {
  return collect({
    courseName: required(v.courseName, "Course"),
    rating: rating(v.rating),
    comment: lengthBetween(v.comment, "Comment", LIMITS.reviewComment.min, LIMITS.reviewComment.max),
  });
}

export function validateAnnouncement(v: { title: string; category: string; body: string }) {
  return collect({
    title: lengthBetween(v.title, "Title", LIMITS.announcementTitle.min, LIMITS.announcementTitle.max),
    category: required(v.category, "Category"),
    body: lengthBetween(v.body, "Body", LIMITS.announcementBody.min, LIMITS.announcementBody.max),
  });
}

/** Escape characters that break PostgREST `or()` filters / ilike patterns. */
export function sanitizeSearch(q: string) {
  return q.replace(/[%_,()\\*]/g, " ").trim().slice(0, 80);
}
