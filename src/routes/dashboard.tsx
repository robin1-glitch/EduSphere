import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Learner dashboard — EduSphere" },
      { name: "description", content: "Your enrolled courses, progress and quiz results on EduSphere." },
      { property: "og:title", content: "Learner dashboard — EduSphere" },
      { property: "og:description", content: "Your enrolled courses, progress and quiz results on EduSphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return <PlaceholderPage title="Learner dashboard" module="Learning & Enrollment" />;
}
