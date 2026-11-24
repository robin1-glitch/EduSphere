import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — EduSphere" },
      { name: "description", content: "Administration tools for managing EduSphere users and content." },
      { property: "og:title", content: "Admin console — EduSphere" },
      { property: "og:description", content: "Administration tools for managing EduSphere users and content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return <PlaceholderPage title="Admin console" module="Identity & Admin" />;
}
