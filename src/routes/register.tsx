import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your free account — EduSphere" },
      { name: "description", content: "Register for a free EduSphere account to enroll in courses and join the community." },
      { property: "og:title", content: "Create your free account — EduSphere" },
      { property: "og:description", content: "Register for a free EduSphere account to enroll in courses and join the community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return <PlaceholderPage title="Register" module="Identity & Admin" />;
}
