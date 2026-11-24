import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, EyeOff, LogIn, Pencil, PenLine, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { StatusBadge } from "@/components/common/Badge";
import { Button, buttonClass } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/Modal";
import { EmptyState, ErrorState, LoadingList } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { PageHeader } from "@/components/common/PageHeader";
import { StarRating } from "@/components/common/StarRating";
import { notify } from "@/components/common/Toast";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { ReviewFormModal, type ReviewFormValues } from "@/components/community/ReviewFormModal";
import { reviewErrorMessage, useDeleteReview, useReviews, useSaveReview, useSetReviewStatus, type Review } from "@/lib/api/reviews";
import { COURSE_NAMES, REVIEWS_PAGE_SIZE } from "@/lib/constants";
import { formatDate, plural } from "@/lib/format";
import { summarizeReviews, visibleReviews } from "@/lib/review-summary";
import { initials, useSession } from "@/lib/session";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Course reviews — EduSphere community" },
      { name: "description", content: "Read honest course reviews and ratings from EduSphere learners, or share your own." },
      { property: "og:title", content: "Course reviews — EduSphere community" },
      { property: "og:description", content: "Ratings and reviews of EduSphere courses from real learners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { user, isAdmin } = useSession();
  const { data, isPending, isError, refetch } = useReviews();
  const save = useSaveReview();
  const setStatus = useSetReviewStatus();
  const del = useDeleteReview();
  const [course, setCourse] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState<Review | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const visible = useMemo(() => visibleReviews(data ?? [], user), [data, user]);
  const summary = useMemo(() => summarizeReviews(visible.filter((r) => !course || r.course_name === course)), [visible, course]);
  const filtered = useMemo(
    () => visible.filter((r) => (!course || r.course_name === course) && (!minRating || r.rating === Number(minRating))),
    [visible, course, minRating],
  );
  const pageRows = filtered.slice((page - 1) * REVIEWS_PAGE_SIZE, page * REVIEWS_PAGE_SIZE);
  const reviewedCourses = useMemo(() => (data ?? []).filter((r) => r.author_name === user?.name).map((r) => r.course_name), [data, user]);

  const editInitial = useMemo<ReviewFormValues | undefined>(
    () => (editing ? { courseName: editing.course_name, rating: editing.rating, comment: editing.comment } : undefined),
    [editing],
  );

  const openCreate = () => { setEditing(null); setServerError(null); setFormOpen(true); };
  const openEdit = (r: Review) => { setEditing(r); setServerError(null); setFormOpen(true); };

  const onSubmit = (v: ReviewFormValues) => {
    if (!user) return;
    save.mutate(
      { ...(editing ? { id: editing.id } : {}), ...v, authorName: user.name },
      {
        onSuccess: () => {
          setFormOpen(false);
          notify.success(editing ? "Review updated" : "Review submitted", "It will appear publicly once an admin approves it.");
        },
        onError: (err) => {
          const msg = reviewErrorMessage(err);
          setServerError(msg);
          notify.error("Review not saved", msg);
        },
      },
    );
  };

  const moderate = (r: Review, status: "Approved" | "Hidden") =>
    setStatus.mutate({ id: r.id, status }, { onSuccess: () => notify.success(status === "Approved" ? "Review approved" : "Review hidden"), onError: () => notify.error("Action failed") });

  const action = user ? (
    <Button onClick={openCreate}><PenLine aria-hidden="true" /> Write a review</Button>
  ) : (
    <Link to="/login" className={buttonClass("primary")}><LogIn aria-hidden="true" /> Log in to write a review</Link>
  );

  return (
    <div className="es-container es-page">
      <PageHeader eyebrow="Community" title="Course reviews" lead="Honest feedback from learners to help you choose your next course." actions={action} />
      <CommunitySubnav />

      {isPending ? (
        <LoadingList count={3} label="Loading reviews" />
      ) : isError ? (
        <ErrorState text="We couldn't load the reviews." onRetry={() => void refetch()} />
      ) : (
        <>
          <Card as="section" className="community-review-summary" aria-labelledby="summary-title">
            <div className="community-review-summary__score">
              <h2 id="summary-title" className="es-sr-only">Rating summary{course ? ` for ${course}` : ""}</h2>
              <p className="community-review-summary__value">{summary.total ? summary.average.toFixed(1) : "–"}</p>
              <StarRating value={summary.average} size="lg" />
              <p className="community-review-summary__count">
                {summary.total ? `${summary.average.toFixed(1)} out of 5 · ${plural(summary.total, "approved review")}` : "No approved reviews yet"}
              </p>
            </div>
            <ul className="community-rating-bars" aria-label="Rating distribution">
              {([5, 4, 3, 2, 1] as const).map((n) => {
                const count = summary.distribution[n];
                const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
                return (
                  <li key={n} className="community-rating-bar">
                    <span>{n} star{n === 1 ? "" : "s"}</span>
                    <progress className="community-rating-bar__track" max={100} value={pct} aria-label={`${n} stars: ${count} reviews (${pct}%)`} />
                    <span className="community-rating-bar__count">{count}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="es-toolbar es-section">
            <div className="es-field">
              <label htmlFor="review-course" className="es-label">Filter by course</label>
              <select id="review-course" className="es-select" value={course} onChange={(e) => { setCourse(e.target.value); setPage(1); }}>
                <option value="">All courses</option>
                {COURSE_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="es-field">
              <label htmlFor="review-rating-filter" className="es-label">Filter by rating</label>
              <select id="review-rating-filter" className="es-select" value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(1); }}>
                <option value="">All ratings</option>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>)}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<Star />} title={visible.length ? "No reviews match your filters" : "No reviews yet"} text={visible.length ? "Try another course or rating." : "Be the first to share your experience."} action={visible.length ? <Button variant="secondary" onClick={() => { setCourse(""); setMinRating(""); }}>Clear filters</Button> : user ? <Button onClick={openCreate}>Write a review</Button> : undefined} />
          ) : (
            <>
              <ul className="community-review-list" aria-label="Reviews">
                {pageRows.map((r) => {
                  const own = r.author_name === user?.name;
                  return (
                    <Card as="li" key={r.id} className="community-review-card">
                      <div className="community-review-card__head">
                        <span className="es-avatar" aria-hidden="true">{initials(r.author_name)}</span>
                        <div className="community-review-card__who">
                          <p className="community-review-card__author">{r.author_name}{own ? " (you)" : ""}</p>
                          <p className="community-review-card__course">{r.course_name}</p>
                        </div>
                        {isAdmin || own ? <StatusBadge status={r.status} /> : null}
                      </div>
                      <div className="es-row">
                        <StarRating value={r.rating} />
                        <span className="community-stars__label">{r.rating} out of 5</span>
                      </div>
                      <p className="community-review-card__text">{r.comment}</p>
                      <div className="community-review-card__foot">
                        <time className="es-meta" dateTime={r.created_at}>{formatDate(r.created_at)}</time>
                        <div className="es-row">
                          {own ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(r)} aria-label={`Edit your review of ${r.course_name}`}><Pencil aria-hidden="true" /> Edit</Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label={`Delete your review of ${r.course_name}`}><Trash2 aria-hidden="true" /> Delete</Button>
                            </>
                          ) : null}
                          {isAdmin ? (
                            <>
                              {r.status !== "Approved" ? <Button variant="secondary" size="sm" onClick={() => moderate(r, "Approved")} aria-label={`Approve review by ${r.author_name}`}><CheckCircle2 aria-hidden="true" /> Approve</Button> : null}
                              {r.status !== "Hidden" ? <Button variant="secondary" size="sm" onClick={() => moderate(r, "Hidden")} aria-label={`Hide review by ${r.author_name}`}><EyeOff aria-hidden="true" /> Hide</Button> : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </ul>
              <Pagination page={page} pageSize={REVIEWS_PAGE_SIZE} total={filtered.length} label="reviews" onPageChange={setPage} />
            </>
          )}
        </>
      )}

      <ReviewFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editing ? "edit" : "create"}
        initial={editInitial}
        reviewedCourses={reviewedCourses}
        loading={save.isPending}
        serverError={serverError}
        onSubmit={onSubmit}
      />
      <ConfirmModal
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete your review?"
        description="Your review will be removed permanently."
        confirmLabel="Delete review"
        loading={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => { setDeleting(null); notify.success("Review deleted"); }, onError: () => notify.error("Couldn't delete the review") })}
      />
    </div>
  );
}
