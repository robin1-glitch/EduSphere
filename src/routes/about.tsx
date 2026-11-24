import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, Heart, Lightbulb, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { buttonClass } from "@/components/common/Button";
import { initials } from "@/lib/session";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EduSphere — Our mission and team" },
      { name: "description", content: "Why EduSphere exists, what learners can do, the values we build on and the team behind the platform." },
      { property: "og:title", content: "About EduSphere — Our mission and team" },
      { property: "og:description", content: "Modern, simple, accessible and encouraging learning for everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  { title: "Learn", text: "Follow structured courses with short video lessons and readable notes." },
  { title: "Practice", text: "Test yourself with quizzes and assessments that explain every answer." },
  { title: "Grow", text: "Track progress, earn certificates and help others in the community." },
];

const VALUES = [
  { icon: Sparkles, title: "Simple", text: "Clear pages and one obvious next step, so learning never feels overwhelming." },
  { icon: Accessibility, title: "Accessible", text: "Built for keyboards, screen readers and every screen size from day one." },
  { icon: Heart, title: "Encouraging", text: "Friendly feedback that celebrates progress instead of punishing mistakes." },
  { icon: Lightbulb, title: "Modern", text: "Up-to-date content and tools that reflect how people learn today." },
];

const TEAM = [
  { name: "Aarav Joshi", role: "Identity & Admin" },
  { name: "Nisha Bhandari", role: "Learning & Enrollment" },
  { name: "Suman Rai", role: "Assessment & Interactive" },
  { name: "Prakash Tamang", role: "Community & Public" },
];

function AboutPage() {
  return (
    <div className="es-container es-page">
      <PageHeader eyebrow="About us" title="Learning that fits your life" lead="EduSphere helps anyone learn new skills at their own pace — with clear lessons, honest practice and a community that has your back." />

      <section className="community-about-intro" aria-labelledby="mission-title">
        <div className="community-about-intro__text">
          <h2 id="mission-title" className="es-section__title">Our mission</h2>
          <p>We believe great education should be easy to start and easy to keep going with. EduSphere brings courses, quizzes and progress tracking together in one calm, uncluttered place.</p>
          <p>Whether you're a student preparing for exams, a professional picking up a new skill or simply curious, our goal is the same: make the next useful step obvious.</p>
        </div>
        <Card aria-labelledby="pillars-title">
          <h2 id="pillars-title" className="es-card__title">What you can do on EduSphere</h2>
          <ol className="es-stack" role="list">
            {PILLARS.map((p, i) => (
              <li key={p.title} className="community-pillar">
                <span className="community-pillar__num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className="es-card__title">{p.title}</h3>
                  <p className="es-card__text">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="es-section" aria-labelledby="values-title">
        <div className="es-section__head">
          <h2 id="values-title" className="es-section__title">Our values</h2>
        </div>
        <ul className="es-grid es-grid--4" role="list">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <Card as="li" key={title}>
              <span className="community-benefit-card__icon" aria-hidden="true"><Icon /></span>
              <h3 className="es-card__title">{title}</h3>
              <p className="community-benefit-card__text">{text}</p>
            </Card>
          ))}
        </ul>
      </section>

      <section className="es-section" aria-labelledby="team-title">
        <div className="es-section__head">
          <div>
            <h2 id="team-title" className="es-section__title">Meet the team</h2>
            <p className="es-section__lead">Four builders, one platform — each owning a part of the learning journey.</p>
          </div>
        </div>
        <ul className="es-grid es-grid--4" role="list">
          {TEAM.map((m) => (
            <Card as="li" key={m.name} className="community-team-card">
              <span className="es-avatar es-avatar--lg" aria-hidden="true">{initials(m.name)}</span>
              <h3 className="es-card__title">{m.name}</h3>
              <p className="community-team-card__role">{m.role}</p>
            </Card>
          ))}
        </ul>
      </section>

      <section className="es-section">
        <div className="community-cta-band">
          <div>
            <h2 className="community-cta-band__title">Ready to start learning?</h2>
            <p className="community-cta-band__text">Create a free account and enroll in your first course today.</p>
          </div>
          <Link to="/register" className={buttonClass("secondary")}>Create free account</Link>
        </div>
      </section>
    </div>
  );
}
