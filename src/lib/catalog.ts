import python from "@/assets/course-python.jpg";
import web from "@/assets/course-web.jpg";
import design from "@/assets/course-design.jpg";
import data from "@/assets/course-data.jpg";
import business from "@/assets/course-business.jpg";
import languages from "@/assets/course-languages.jpg";

/** Sample public catalog content (the Courses module owns the real data). */
export const PLATFORM_STATS = [
  { key: "learners", label: "Learners", value: "12,480" },
  { key: "courses", label: "Courses", value: "86" },
  { key: "lessons", label: "Lessons", value: "1,240" },
  { key: "quizzes", label: "Quizzes", value: "640" },
] as const;

export const CATEGORIES = [
  { key: "programming", name: "Programming", count: 18 },
  { key: "business", name: "Business", count: 14 },
  { key: "design", name: "Design", count: 11 },
  { key: "data", name: "Data", count: 16 },
  { key: "languages", name: "Languages", count: 12 },
  { key: "science", name: "Science", count: 15 },
] as const;

export type Level = "Beginner" | "Intermediate" | "Advanced";

export const FEATURED_COURSES: { title: string; description: string; level: Level; duration: string; image: string; alt: string }[] = [
  { title: "Introduction to Python", description: "Write your first programs with variables, loops and functions through short, hands-on lessons.", level: "Beginner", duration: "6 hours", image: python, alt: "Illustration of a laptop showing code with a friendly snake" },
  { title: "Web Development Fundamentals", description: "Build accessible web pages with HTML and CSS, from layout basics to responsive design.", level: "Beginner", duration: "8 hours", image: web, alt: "Illustration of a browser window with page layout blocks" },
  { title: "UI Design Basics", description: "Learn layout, color, typography and contrast to design clear, friendly interfaces.", level: "Beginner", duration: "5 hours", image: design, alt: "Illustration of a design canvas with shapes and a pen tool" },
  { title: "Data Analysis with Excel", description: "Clean data, build pivot tables and create charts that answer real questions.", level: "Intermediate", duration: "7 hours", image: data, alt: "Illustration of a spreadsheet with bar and pie charts" },
  { title: "Business Communication", description: "Write clear emails, run better meetings and present ideas with confidence.", level: "Intermediate", duration: "4 hours", image: business, alt: "Illustration of two people presenting charts to an audience" },
  { title: "Spanish for Beginners", description: "Start speaking everyday Spanish with practical phrases and short conversation drills.", level: "Beginner", duration: "10 hours", image: languages, alt: "Illustration of speech bubbles next to a globe and a notebook" },
];
