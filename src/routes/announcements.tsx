import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronDown, ChevronUp, Megaphone, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge, PinnedBadge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/Modal";
import { EmptyState, ErrorState, LoadingList } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { notify } from "@/components/common/Toast";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { AnnouncementFormModal, type AnnouncementFormValues } from "@/components/community/AnnouncementFormModal";
import { announcementTone } from "@/components/community/announcement-tone";
import { useAnnouncements, useDeleteAnnouncement, useSaveAnnouncement, type Announcement } from "@/lib/api/announcements";
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENTS_PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — EduSphere" },
      { name: "description", content: "Platform updates, events and maintenance notices from the EduSphere team." },
      { property: "og:title", content: "Announcements — EduSphere" },
      { property: "og:description", content: "The latest news, events and updates from EduSphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementCard({ a, isAdmin, onEdit, onDelete }: { a: Announcement; isAdmin: boolean; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const long = a.body.length > 160;
  const bodyId = `ann-body-${a.id}`;
  return (
    <Card as="li" className={`community-announcement-card${a.is_pinned ? " community-announcement-card--pinned" : ""}`}>
      <div className="community-announcement-card__head">
        <div className="es-row">
          {a.is_pinned ? <PinnedBadge /> : null}
          <Badge tone={announcementTone(a.category)}>{a.category}</Badge>
        </div>
        <span className="es-meta"><span className="es-meta__item"><CalendarDays aria-hidden="true" /><time dateTime={a.created_at}>{formatDate(a.created_at)}</time></span></span>
      </div>
      <h2 className="es-card__title">{a.title}</h2>
      <p id={bodyId} className={`community-announcement-card__body${long && !expanded ? " community-announcement-card__body--clamped" : ""}`}>{a.body}</p>
      <div className="community-announcement-card__foot">
        {long ? (
          <button type="button" className="es-link es-link--with-icon community-announcement-card__toggle" aria-expanded={expanded} aria-controls={bodyId} onClick={() => setExpanded((v) => !v)}>
            {expanded ? <>Show less <ChevronUp aria-hidden="true" /></> : <>Read more <ChevronDown aria-hidden="true" /></>}
            <span className="es-sr-only"> about {a.title}</span>
          </button>
        ) : <span />}
        {isAdmin ? (
          <div className="es-row">
            <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit announcement: ${a.title}`}><Pencil aria-hidden="true" /> Edit</Button>
            <Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete announcement: ${a.title}`}><Trash2 aria-hidden="true" /> Delete</Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function AnnouncementsPage() {
  const { isAdmin } = useSession();
  const { data, isPending, isError, refetch } = useAnnouncements();
  const save = useSaveAnnouncement();
  const del = useDeleteAnnouncement();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((a) => (!category || a.category === category) && (!term || `${a.title} ${a.body}`.toLowerCase().includes(term)));
  }, [data, q, category]);
  const rows = filtered.slice((page - 1) * ANNOUNCEMENTS_PAGE_SIZE, page * ANNOUNCEMENTS_PAGE_SIZE);

  const initial = useMemo<AnnouncementFormValues | undefined>(
    () => (editing ? { title: editing.title, category: editing.category, body: editing.body, isPinned: editing.is_pinned } : undefined),
    [editing],
  );

  const onSubmit = (v: AnnouncementFormValues) =>
    save.mutate(
      { ...(editing ? { id: editing.id } : {}), ...v },
      {
        onSuccess: () => { setFormOpen(false); notify.success(editing ? "Announcement updated" : "Announcement published"); },
        onError: () => notify.error("Couldn't save the announcement", "Please try again."),
      },
    );

  return (
    <div className="es-container es-page">
      <PageHeader
        eyebrow="Community"
        title="Announcements"
        lead="Updates, events and maintenance notices from the EduSphere team."
        actions={isAdmin ? <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus aria-hidden="true" /> Add announcement</Button> : undefined}
      />
      <CommunitySubnav />

      <form className="es-toolbar" role="search" aria-label="Filter announcements" onSubmit={(e) => e.preventDefault()}>
        <div className="es-field">
          <label htmlFor="ann-search" className="es-label">Search announcements</label>
          <div className="es-input-icon">
            <Search aria-hidden="true" />
            <input id="ann-search" type="search" className="es-input" placeholder="Search by title or text" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
        </div>
        <div className="es-field">
          <label htmlFor="ann-category" className="es-label">Category</label>
          <select id="ann-category" className="es-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {ANNOUNCEMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </form>

      {isPending ? (
        <LoadingList count={3} label="Loading announcements" />
      ) : isError ? (
        <ErrorState text="We couldn't load the announcements." onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Megaphone />}
          title={data.length ? "No announcements match your search" : "No announcements yet"}
          text={data.length ? "Try a different word or category." : "News from the team will appear here."}
          action={data.length ? <Button variant="secondary" onClick={() => { setQ(""); setCategory(""); }}>Clear filters</Button> : undefined}
        />
      ) : (
        <>
          <ul className="community-announcement-list" aria-label="Announcements">
            {rows.map((a) => (
              <AnnouncementCard key={a.id} a={a} isAdmin={isAdmin} onEdit={() => { setEditing(a); setFormOpen(true); }} onDelete={() => setDeleting(a)} />
            ))}
          </ul>
          <Pagination page={page} pageSize={ANNOUNCEMENTS_PAGE_SIZE} total={filtered.length} label="announcements" onPageChange={setPage} />
        </>
      )}

      <AnnouncementFormModal open={formOpen} onOpenChange={setFormOpen} initial={initial} loading={save.isPending} onSubmit={onSubmit} />
      <ConfirmModal
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this announcement?"
        description={deleting ? `“${deleting.title}” will be removed permanently.` : ""}
        confirmLabel="Delete announcement"
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => { setDeleting(null); notify.success("Announcement deleted"); }, onError: () => notify.error("Couldn't delete the announcement") })}
      />
    </div>
  );
}
