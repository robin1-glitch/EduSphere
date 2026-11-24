import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — EduSphere" },
      { name: "description", content: "Browse EduSphere courses in programming, business, design, data, languages and science." },
      { property: "og:title", content: "Courses — EduSphere" },
      { property: "og:description", content: "Browse EduSphere courses in programming, business, design, data, languages and science." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return <PlaceholderPage title="Courses" module="Learning & Enrollment" />;
}
