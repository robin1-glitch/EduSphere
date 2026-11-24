export const FORUM_CATEGORIES = [
  "General",
  "Courses help",
  "Study tips",
  "Projects",
  "Announcements-feedback",
] as const;
export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export const POST_STATUSES = ["Open", "Locked", "Hidden"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const REVIEW_STATUSES = ["Approved", "Pending", "Hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const ANNOUNCEMENT_CATEGORIES = ["Update", "Event", "Maintenance"] as const;
export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const CONTACT_SUBJECTS = [
  "General question",
  "Course support",
  "Technical issue",
  "Account help",
  "Partnership",
  "Feedback",
] as const;

export const FAQ_GROUPS = ["Getting started", "Courses", "Assessments", "Account", "Community"] as const;

export const COURSE_NAMES = [
  "Introduction to Python",
  "Web Development Fundamentals",
  "Business Communication",
  "UI Design Basics",
  "Data Analysis with Excel",
  "Spanish for Beginners",
  "Foundations of Physics",
] as const;

export const FORUM_PAGE_SIZE = 5;
export const REVIEWS_PAGE_SIZE = 6;
export const ANNOUNCEMENTS_PAGE_SIZE = 5;
