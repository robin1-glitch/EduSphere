import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, MessagesSquare, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button, buttonClass } from "@/components/common/Button";
import { EmptyState, ErrorState, LoadingList } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { notify } from "@/components/common/Toast";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { PostCard } from "@/components/community/PostCard";
import { PostFormModal, type PostFormValues } from "@/components/community/PostFormModal";
import { useCreatePost, usePosts, type PostSort } from "@/lib/api/forum";
import { FORUM_CATEGORIES, FORUM_PAGE_SIZE } from "@/lib/constants";
import { useSession } from "@/lib/session";

type ForumSearch = { q?: string | undefined; category?: string | undefined; sort?: PostSort | undefined; page?: number | undefined };

export const Route = createFileRoute("/community/")({
  validateSearch: (s: Record<string, unknown>): ForumSearch => {
    const out: ForumSearch = {};
    if (typeof s["q"] === "string" && s["q"]) out.q = s["q"].slice(0, 80);
    if (typeof s["category"] === "string" && (FORUM_CATEGORIES as readonly string[]).includes(s["category"])) out.category = s["category"];
    if (s["sort"] === "replies") out.sort = "replies";
    const page = Number(s["page"]);
    if (Number.isInteger(page) && page > 1) out.page = page;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Community forum — EduSphere" },
      { name: "description", content: "Ask questions, share study tips and show your projects in the EduSphere learner community." },
      { property: "og:title", content: "Community forum — EduSphere" },
      { property: "og:description", content: "Join discussions with other EduSphere learners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForumPage,
});

function ForumPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/community/" });
  const { user, isAdmin } = useSession();
  const [term, setTerm] = useState(search.q ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const createPost = useCreatePost();

  const page = search.page ?? 1;
  const params = { q: search.q ?? "", category: search.category ?? "", sort: search.sort ?? "newest", page, includeHidden: isAdmin } as const;
  const { data, isPending, isError, isFetching, refetch } = usePosts(params);

  // Live search (debounced) — keeps the URL shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((search.q ?? "") !== term.trim()) {
        void navigate({ search: (prev) => ({ ...prev, q: term.trim() || undefined, page: undefined }), replace: true });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [term, search.q, navigate]);

  const hasFilters = Boolean(search.q || search.category);

  const onCreate = (v: PostFormValues) => {
    if (!user) return;
    createPost.mutate(
      { ...v, authorName: user.name },
      {
        onSuccess: (post) => {
          setCreateOpen(false);
          notify.success("Discussion published", "Your post is now live in the forum.");
          void navigate({ to: "/community/$id", params: { id: post.id } });
        },
        onError: () => notify.error("Couldn't publish your post", "Please try again."),
      },
    );
  };

  const createAction = user ? (
    <Button onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" /> Create post</Button>
  ) : (
    <Link to="/login" className={buttonClass("primary")}><LogIn aria-hidden="true" /> Log in to post</Link>
  );

  return (
    <div className="es-container es-page">
      <PageHeader eyebrow="Community" title="Discussion forum" lead="Ask questions, share study tips and celebrate progress with other learners." actions={createAction} />
      <CommunitySubnav />

      <form className="es-toolbar es-toolbar--3" role="search" aria-label="Filter discussions" onSubmit={(e) => e.preventDefault()}>
        <div className="es-field">
          <label htmlFor="forum-search" className="es-label">Search discussions</label>
          <div className="es-input-icon">
            <Search aria-hidden="true" />
            <input id="forum-search" type="search" className="es-input" placeholder="Search by title, content or author" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </div>
        <div className="es-field">
          <label htmlFor="forum-category" className="es-label">Category</label>
          <select id="forum-category" className="es-select" value={search.category ?? ""} onChange={(e) => void navigate({ search: (prev) => ({ ...prev, category: e.target.value || undefined, page: undefined }) })}>
            <option value="">All categories</option>
            {FORUM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="es-field">
          <label htmlFor="forum-sort" className="es-label">Sort by</label>
          <select id="forum-sort" className="es-select" value={search.sort ?? "newest"} onChange={(e) => void navigate({ search: (prev) => ({ ...prev, sort: e.target.value === "replies" ? "replies" : undefined, page: undefined }) })}>
            <option value="newest">Newest</option>
            <option value="replies">Most replies</option>
          </select>
        </div>
      </form>

      <div aria-busy={isFetching || undefined}>
        {isPending ? (
          <LoadingList count={4} label="Loading discussions" />
        ) : isError ? (
          <ErrorState text="We couldn't load the discussions. Please try again." onRetry={() => void refetch()} />
        ) : data.rows.length === 0 ? (
          hasFilters ? (
            <EmptyState icon={<Search />} title="No discussions match your filters" text="Try a different search term or category." action={<Button variant="secondary" onClick={() => { setTerm(""); void navigate({ search: {} }); }}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={<MessagesSquare />} title="No discussions yet" text="Be the first to ask a question or share a tip." action={user ? <Button onClick={() => setCreateOpen(true)}>Start a discussion</Button> : <Link to="/login" className={buttonClass("primary")}>Log in to start a discussion</Link>} />
          )
        ) : (
          <>
            <ul className="community-post-list" aria-label="Discussions">
              {data.rows.map((p) => <PostCard key={p.id} post={p} showModeration={isAdmin} />)}
            </ul>
            <Pagination page={page} pageSize={FORUM_PAGE_SIZE} total={data.total} label="discussions" onPageChange={(p) => { void navigate({ search: (prev) => ({ ...prev, page: p > 1 ? p : undefined }) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </>
        )}
      </div>

      <PostFormModal open={createOpen} onOpenChange={setCreateOpen} mode="create" loading={createPost.isPending} onSubmit={onCreate} />
    </div>
  );
}
