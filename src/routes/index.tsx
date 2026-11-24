import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, BookOpen, Briefcase, CalendarDays, CheckCircle2, Clock, Code2, Database, FileQuestion,
  FlaskConical, Gauge, Languages, Megaphone, Palette, PlayCircle, Users,
} from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { buttonClass } from "@/components/common/Button";
import { ErrorState, LoadingList, EmptyState } from "@/components/common/EmptyState";
import { CATEGORIES, FEATURED_COURSES, PLATFORM_STATS } from "@/lib/catalog";
import { useLatestAnnouncements } from "@/lib/api/announcements";
import { formatDate } from "@/lib/format";
import { announcementTone } from "@/components/community/announcement-tone";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduSphere — Learn new skills at your own pace" },
      { name: "description", content: "Browse beginner-friendly courses, practise with quizzes, track your progress and join a supportive learner community on EduSphere." },
      { property: "og:title", content: "EduSphere — Learn new skills at your own pace" },
      { property: "og:description", content: "Courses, quizzes, progress tracking and a friendly community. Learn. Practice. Grow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const STAT_ICONS = { learners: Users, courses: BookOpen, lessons: PlayCircle, quizzes: FileQuestion } as const;
const CATEGORY_ICONS = { programming: Code2, business: Briefcase, design: Palette, data: Database, languages: Languages, science: FlaskConical } as const;

const BENEFITS = [
  { icon: Clock, title: "Learn at your pace", text: "Short lessons you can start, pause and resume whenever it suits you." },
  { icon: CheckCircle2, title: "Practice with quizzes", text: "Check your understanding with instant feedback after every lesson." },
  { icon: Gauge, title: "Track your progress", text: "See completed lessons, quiz scores and weekly goals in one place." },
  { icon: Users, title: "Join the community", text: "Ask questions, share tips and learn together with other learners." },
];

function HomePage() {
  return (
    <>
      <section className="community-hero" aria-labelledby="hero-title">
        <div className="es-container community-hero__grid">
          <div>
            <div className="community-hero__badge"><Badge tone="primary">Learn. Practice. Grow.</Badge></div>
            <h1 id="hero-title" className="community-hero__title">
              Learn new skills <span className="community-hero__title-accent">at your own pace</span>
            </h1>
            <p className="community-hero__lead">
              Friendly courses, quick practice quizzes and a community that cheers you on. Start with a free account and grow one lesson at a time.
            </p>
            <div className="community-hero__actions">
              <Link to="/courses" className={buttonClass("primary")}>Browse courses <ArrowRight aria-hidden="true" /></Link>
              <Link to="/register" className={buttonClass("secondary")}>Create free account</Link>
            </div>
            <div className="community-hero__trust">
              <span><CheckCircle2 aria-hidden="true" /> Free beginner courses</span>
              <span><CheckCircle2 aria-hidden="true" /> No credit card needed</span>
            </div>
          </div>
          <div className="community-hero__media">
            <img src={heroImage} alt="Three students learning together on laptops and a tablet around an open book" width={1448} height={1086} />
          </div>
        </div>
      </section>

      <section className="es-section" aria-labelledby="stats-title">
        <div className="es-container">
          <h2 id="stats-title" className="es-sr-only">Platform statistics</h2>
          <ul className="es-grid es-grid--4" role="list">
            {PLATFORM_STATS.map((s) => {
              const Icon = STAT_ICONS[s.key];
              return (
                <Card as="li" key={s.key} className="community-stat-card">
                  <span className="community-stat-card__icon" aria-hidden="true"><Icon /></span>
                  <div>
                    <p className="community-stat-card__value">{s.value}</p>
                    <p className="community-stat-card__label">{s.label}</p>
                  </div>
                </Card>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="es-section" aria-labelledby="categories-title">
        <div className="es-container">
          <div className="es-section__head">
            <div>
              <h2 id="categories-title" className="es-section__title">Explore categories</h2>
              <p className="es-section__lead">Pick a subject to see courses for every level.</p>
            </div>
          </div>
          <ul className="es-grid es-grid--6" role="list">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.key];
              return (
                <li key={c.key}>
                  <Link to="/courses" className="es-card es-card--interactive community-category-card" aria-label={`${c.name}, ${c.count} courses`}>
                    <span className="community-category-card__icon" aria-hidden="true"><Icon /></span>
                    <span className="es-card__title">{c.name}</span>
                    <span className="community-category-card__count">{c.count} courses</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="es-section" aria-labelledby="featured-title">
        <div className="es-container">
          <div className="es-section__head">
            <div>
              <h2 id="featured-title" className="es-section__title">Featured courses</h2>
              <p className="es-section__lead">Popular picks to get you started this week.</p>
            </div>
            <Link to="/courses" className="es-link es-link--with-icon">View all courses <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="es-grid es-grid--3" role="list">
            {FEATURED_COURSES.map((c) => (
              <Card as="li" key={c.title} flush className="community-course-card">
                <div className="community-course-card__media">
                  <img src={c.image} alt={c.alt} loading="lazy" width={1672} height={941} />
                </div>
                <div className="community-course-card__body">
                  <div className="es-row">
                    <Badge tone={c.level === "Beginner" ? "primary" : "neutral"}>{c.level}</Badge>
                  </div>
                  <h3 className="es-card__title">{c.title}</h3>
                  <p className="community-course-card__desc">{c.description}</p>
                  <div className="community-course-card__foot">
                    <span className="es-meta"><span className="es-meta__item"><Clock aria-hidden="true" />{c.duration}</span></span>
                    <Link to="/courses" className={buttonClass("secondary", { size: "sm" })} aria-label={`View course: ${c.title}`}>View course</Link>
                  </div>
                </div>
              </Card>
            ))}
          </ul>
        </div>
      </section>

      <section className="es-section" aria-labelledby="why-title">
        <div className="es-container">
          <div className="es-section__head">
            <div>
              <h2 id="why-title" className="es-section__title">Why choose EduSphere</h2>
              <p className="es-section__lead">Everything you need to keep learning — and nothing you don't.</p>
            </div>
          </div>
          <ul className="es-grid es-grid--4" role="list">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <Card as="li" key={title}>
                <span className="community-benefit-card__icon" aria-hidden="true"><Icon /></span>
                <h3 className="es-card__title">{title}</h3>
                <p className="community-benefit-card__text">{text}</p>
              </Card>
            ))}
          </ul>
        </div>
      </section>

      <LatestAnnouncements />

      <section className="es-section" aria-labelledby="cta-title">
        <div className="es-container">
          <div className="community-cta-band">
            <div>
              <h2 id="cta-title" className="community-cta-band__title">Have a question? Ask the community.</h2>
              <p className="community-cta-band__text">Thousands of learners share tips, answers and projects every day.</p>
            </div>
            <Link to="/community" className={buttonClass("secondary")}>Visit the forum <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function LatestAnnouncements() {
  const { data, isPending, isError, refetch } = useLatestAnnouncements(3);
  return (
    <section className="es-section" aria-labelledby="news-title">
      <div className="es-container">
        <div className="es-section__head">
          <div>
            <h2 id="news-title" className="es-section__title">Latest announcements</h2>
            <p className="es-section__lead">News, events and updates from the EduSphere team.</p>
          </div>
          <Link to="/announcements" className="es-link es-link--with-icon">View all announcements <ArrowRight aria-hidden="true" /></Link>
        </div>
        {isPending ? (
          <LoadingList count={1} label="Loading announcements" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState icon={<Megaphone />} title="No announcements yet" text="Check back soon for news from the team." />
        ) : (
          <ul className="es-grid es-grid--3" role="list">
            {data.map((a) => (
              <Card as="li" key={a.id} className="community-announcement-preview">
                <div className="es-row es-row--between">
                  <Badge tone={announcementTone(a.category)}>{a.category}</Badge>
                  <span className="es-meta"><span className="es-meta__item"><CalendarDays aria-hidden="true" /><time dateTime={a.created_at}>{formatDate(a.created_at)}</time></span></span>
                </div>
                <h3 className="es-card__title">{a.title}</h3>
                <p className="community-announcement-preview__body">{a.body}</p>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

