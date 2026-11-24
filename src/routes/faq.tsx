import { useMemo, useState, Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Search, SearchX } from "lucide-react";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { buttonClass } from "@/components/common/Button";
import { EmptyState, ErrorState, LoadingList } from "@/components/common/EmptyState";
import { useFaqItems, type FaqItem } from "@/lib/api/public";
import { FAQ_GROUPS } from "@/lib/constants";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — EduSphere help centre" },
      { name: "description", content: "Answers about getting started, courses, assessments, your account and the EduSphere community." },
      { property: "og:title", content: "FAQ — EduSphere help centre" },
      { property: "og:description", content: "Search frequently asked questions about learning on EduSphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return (
    <>
      {parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="community-faq-mark">{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

function FaqAccordionItem({ item, q, open, onToggle }: { item: FaqItem; q: string; open: boolean; onToggle: () => void }) {
  const btnId = `faq-btn-${item.id}`;
  const panelId = `faq-panel-${item.id}`;
  return (
    <li className="community-faq-item">
      <h3 className="community-faq-item__heading">
        <button type="button" id={btnId} className="community-faq-item__trigger" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <span><Highlight text={item.question} q={q} /></span>
          <ChevronDown aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} className="community-faq-item__panel" hidden={!open}>
        <p><Highlight text={item.answer} q={q} /></p>
      </div>
    </li>
  );
}

function FaqPage() {
  const { data, isPending, isError, refetch } = useFaqItems();
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const q = query.trim();

  const groups = useMemo(() => {
    const items = (data ?? []).filter((i) => !q || `${i.question} ${i.answer}`.toLowerCase().includes(q.toLowerCase()));
    return FAQ_GROUPS.map((g) => ({ group: g, items: items.filter((i) => i.group_name === g) })).filter((g) => g.items.length);
  }, [data, q]);
  const resultCount = groups.reduce((n, g) => n + g.items.length, 0);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="es-container es-page">
      <PageHeader eyebrow="Help centre" title="Frequently asked questions" lead="Quick answers about learning on EduSphere. Can't find what you need? Our support team is happy to help." />

      <div className="es-field community-faq-search">
        <label htmlFor="faq-search" className="es-label">Search questions</label>
        <div className="es-input-icon">
          <Search aria-hidden="true" />
          <input id="faq-search" type="search" className="es-input" placeholder="Try “certificate” or “password”" value={query} onChange={(e) => setQuery(e.target.value)} aria-describedby="faq-search-status" />
        </div>
        <p id="faq-search-status" className="es-help" aria-live="polite">
          {data ? (q ? `${resultCount} matching question${resultCount === 1 ? "" : "s"}` : `${data.length} questions in ${FAQ_GROUPS.length} topics`) : ""}
        </p>
      </div>

      <div className="community-faq-layout">
        <nav className="community-faq-toc" aria-label="FAQ topics">
          <ul className="community-faq-toc__list">
            {groups.map((g) => (
              <li key={g.group}>
                <a href={`#${slug(g.group)}`}>
                  <span>{g.group}</span>
                  <span className="es-help">{g.items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {isPending ? (
            <LoadingList count={3} label="Loading questions" />
          ) : isError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : groups.length === 0 ? (
            <EmptyState icon={<SearchX />} title="No questions match your search" text="Try a different word, or contact us and we'll answer personally." action={<button type="button" className={buttonClass("secondary")} onClick={() => setQuery("")}>Clear search</button>} />
          ) : (
            groups.map((g) => (
              <section key={g.group} className="community-faq-group" aria-labelledby={slug(g.group)}>
                <h2 id={slug(g.group)} className="community-faq-group__title">{g.group}</h2>
                <Card flush>
                  <ul className="community-faq-list">
                    {g.items.map((item) => (
                      <FaqAccordionItem key={item.id} item={item} q={q} open={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
                    ))}
                  </ul>
                </Card>
              </section>
            ))
          )}

          <Card className="community-faq-help">
            <h2 className="es-section__title">Still need help?</h2>
            <p className="es-card__text">Send us a message and our support team will reply within one working day.</p>
            <Link to="/contact" className={buttonClass("primary")}>Contact us</Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
