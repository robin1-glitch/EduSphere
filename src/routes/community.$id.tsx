import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Eye, EyeOff, Lock, LogIn, MessageSquare, Pencil, Pin, PinOff, ShieldCheck, Trash2, Unlock, User } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge, PinnedBadge, StatusBadge } from "@/components/common/Badge";
import { Button, buttonClass } from "@/components/common/Button";
import { ConfirmModal, Modal } from "@/components/common/Modal";
import { EmptyState, ErrorState, LoadingList } from "@/components/common/EmptyState";
import { TextAreaField } from "@/components/common/FormField";
import { notify } from "@/components/common/Toast";
import { CommunitySubnav } from "@/components/community/CommunitySubnav";
import { PostFormModal, type PostFormValues } from "@/components/community/PostFormModal";
import {
  useCreateReply, useDeletePost, useDeleteReply, usePost, useReplies, useUpdatePost, useUpdateReply, type ForumReply,
} from "@/lib/api/forum";
import { formatDate, plural, timeAgo } from "@/lib/format";
import { initials, useSession } from "@/lib/session";
import { LIMITS, lengthBetween } from "@/lib/validation";

export const Route = createFileRoute("/community/$id")({
  head: () => ({
    meta: [
      { title: "Discussion — EduSphere community" },
      { name: "description", content: "Read and reply to a discussion in the EduSphere learner community." },
      { property: "og:title", content: "Discussion — EduSphere community" },
      { property: "og:description", content: "Join the conversation with other EduSphere learners." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiscussionPage,
});

type Pending = { kind: "post" } | { kind: "reply"; reply: ForumReply } | null;

function DiscussionPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useSession();
  const post = usePost(id);
  const replies = useReplies(id);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const deleteReply = useDeleteReply();
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<Pending>(null);
  const [editingReply, setEditingReply] = useState<ForumReply | null>(null);

  const initial = useMemo<PostFormValues | undefined>(
    () => (post.data ? { title: post.data.title, category: post.data.category, content: post.data.content } : undefined),
    [post.data],
  );

  if (post.isPending) return <Shell><LoadingList count={2} label="Loading discussion" /></Shell>;
  if (post.isError) return <Shell><ErrorState onRetry={() => void post.refetch()} /></Shell>;
  const p = post.data;
  if (!p || (p.status === "Hidden" && !isAdmin)) {
    return (
      <Shell>
        <EmptyState icon={<EyeOff />} title="This discussion isn't available" text="It may have been removed or hidden by a moderator." action={<Link to="/community" className={buttonClass("primary")}>Back to discussions</Link>} />
      </Shell>
    );
  }

  const isAuthor = user?.name === p.author_name;
  const locked = p.status === "Locked";

  const moderate = (patch: Parameters<typeof updatePost.mutate>[0]["patch"], message: string) =>
    updatePost.mutate({ id: p.id, patch }, { onSuccess: () => notify.success(message), onError: () => notify.error("Action failed", "Please try again.") });

  const onConfirmDelete = () => {
    if (confirm?.kind === "post") {
      deletePost.mutate(p.id, {
        onSuccess: () => {
          setConfirm(null);
          notify.success("Discussion deleted");
          void navigate({ to: "/community" });
        },
        onError: () => notify.error("Couldn't delete the discussion"),
      });
    } else if (confirm?.kind === "reply") {
      deleteReply.mutate(confirm.reply.id, {
        onSuccess: () => {
          setConfirm(null);
          notify.success("Reply deleted");
        },
        onError: () => notify.error("Couldn't delete the reply"),
      });
    }
  };

  return (
    <Shell>
      <div className="es-grid-12">
        <div className="es-span-8">
          <Card as="article" aria-labelledby="post-title">
            <header className="community-post-detail__head">
              <div className="community-post-card__badges">
                {p.is_pinned ? <PinnedBadge /> : null}
                <Badge>{p.category}</Badge>
                <StatusBadge status={p.status} />
              </div>
              <h1 id="post-title" className="community-post-detail__title">{p.title}</h1>
              <div className="es-meta">
                <span className="es-meta__item"><User aria-hidden="true" />{p.author_name}</span>
                <span className="es-meta__item"><CalendarDays aria-hidden="true" /><time dateTime={p.created_at}>{formatDate(p.created_at)}</time></span>
                <span className="es-meta__item"><MessageSquare aria-hidden="true" />{plural(p.reply_count, "reply", "replies")}</span>
              </div>
            </header>
            <p className="community-post-detail__content">{p.content}</p>
            {isAuthor ? (
              <div className="community-post-detail__actions">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}><Pencil aria-hidden="true" /> Edit post</Button>
                <Button variant="danger-outline" size="sm" onClick={() => setConfirm({ kind: "post" })}><Trash2 aria-hidden="true" /> Delete post</Button>
              </div>
            ) : null}
          </Card>

          <section className="community-replies" aria-labelledby="replies-title">
            <h2 id="replies-title" className="community-replies__title">Replies ({p.reply_count})</h2>
            {replies.isPending ? (
              <LoadingList count={2} label="Loading replies" />
            ) : replies.isError ? (
              <ErrorState text="We couldn't load the replies." onRetry={() => void replies.refetch()} />
            ) : replies.data.length === 0 ? (
              <EmptyState icon={<MessageSquare />} title="No replies yet" text={locked ? "This thread is locked." : "Share your thoughts to get the conversation going."} />
            ) : (
              <ul className="community-reply-list">
                {replies.data.map((r) => (
                  <Card as="li" key={r.id} className="community-reply">
                    <span className="es-avatar" aria-hidden="true">{initials(r.author_name)}</span>
                    <div className="community-reply__body">
                      <div className="community-reply__head">
                        <div className="es-row">
                          <span className="community-reply__author">{r.author_name}</span>
                          {r.author_name === p.author_name ? <Badge tone="primary">Author</Badge> : null}
                          <span className="es-meta"><time dateTime={r.created_at}>{timeAgo(r.created_at)}</time></span>
                        </div>
                        {user?.name === r.author_name || isAdmin ? (
                          <div className="community-reply__actions">
                            {user?.name === r.author_name ? (
                              <Button variant="ghost" size="sm" onClick={() => setEditingReply(r)} aria-label={`Edit your reply from ${timeAgo(r.created_at)}`}><Pencil aria-hidden="true" /> Edit</Button>
                            ) : null}
                            <Button variant="ghost" size="sm" onClick={() => setConfirm({ kind: "reply", reply: r })} aria-label={`Delete reply by ${r.author_name}`}><Trash2 aria-hidden="true" /> Delete</Button>
                          </div>
                        ) : null}
                      </div>
                      <p className="community-reply__content">{r.content}</p>
                    </div>
                  </Card>
                ))}
              </ul>
            )}

            <ReplyForm postId={p.id} locked={locked} />
          </section>
        </div>

        <aside className="es-span-4 community-side" aria-label="Discussion details">
          <Card>
            <h2 className="es-card__title">About this discussion</h2>
            <dl className="community-side__dl">
              <dt>Category</dt><dd>{p.category}</dd>
              <dt>Status</dt><dd>{p.status}</dd>
              <dt>Started</dt><dd>{formatDate(p.created_at)}</dd>
              <dt>Replies</dt><dd>{p.reply_count}</dd>
            </dl>
          </Card>
          {isAdmin ? (
            <Card className="community-mod-panel" aria-labelledby="mod-title">
              <h2 id="mod-title" className="community-mod-panel__title"><ShieldCheck aria-hidden="true" /> Moderator tools</h2>
              <p className="es-help">Only admins can see these controls.</p>
              <div className="community-mod-panel__actions">
                {p.status === "Hidden" ? (
                  <Button variant="secondary" block onClick={() => moderate({ status: "Open" }, "Discussion is visible again")} disabled={updatePost.isPending}><Eye aria-hidden="true" /> Unhide thread</Button>
                ) : (
                  <Button variant="secondary" block onClick={() => moderate({ status: "Hidden" }, "Discussion hidden")} disabled={updatePost.isPending}><EyeOff aria-hidden="true" /> Hide thread</Button>
                )}
                {locked ? (
                  <Button variant="secondary" block onClick={() => moderate({ status: "Open" }, "Thread unlocked")} disabled={updatePost.isPending}><Unlock aria-hidden="true" /> Unlock thread</Button>
                ) : (
                  <Button variant="secondary" block onClick={() => moderate({ status: "Locked" }, "Thread locked")} disabled={updatePost.isPending || p.status === "Hidden"}><Lock aria-hidden="true" /> Lock thread</Button>
                )}
                <Button variant="secondary" block onClick={() => moderate({ is_pinned: !p.is_pinned }, p.is_pinned ? "Discussion unpinned" : "Discussion pinned")} disabled={updatePost.isPending}>
                  {p.is_pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />} {p.is_pinned ? "Unpin" : "Pin to top"}
                </Button>
                <Button variant="danger-outline" block onClick={() => setConfirm({ kind: "post" })}><Trash2 aria-hidden="true" /> Delete thread</Button>
              </div>
            </Card>
          ) : null}
        </aside>
      </div>

      <PostFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initial={initial}
        loading={updatePost.isPending}
        onSubmit={(v) =>
          updatePost.mutate(
            { id: p.id, patch: { title: v.title.trim(), category: v.category, content: v.content.trim() } },
            { onSuccess: () => { setEditOpen(false); notify.success("Post updated"); }, onError: () => notify.error("Couldn't save your changes") },
          )
        }
      />
      <EditReplyModal reply={editingReply} onClose={() => setEditingReply(null)} />
      <ConfirmModal
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === "reply" ? "Delete this reply?" : "Delete this discussion?"}
        description={confirm?.kind === "reply" ? "The reply will be removed permanently." : "The discussion and all of its replies will be removed permanently."}
        confirmLabel={confirm?.kind === "reply" ? "Delete reply" : "Delete discussion"}
        loading={deletePost.isPending || deleteReply.isPending}
        onConfirm={onConfirmDelete}
      />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="es-container es-page">
      <CommunitySubnav />
      <Link to="/community" className="es-link es-link--with-icon community-back-link"><ArrowLeft aria-hidden="true" /> All discussions</Link>
      {children}
    </div>
  );
}

function ReplyForm({ postId, locked }: { postId: string; locked: boolean }) {
  const { user } = useSession();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateReply();

  if (locked) {
    return (
      <div className="es-notice es-notice--warning community-reply-form" role="status">
        <Lock aria-hidden="true" />
        <div><strong>This thread is locked.</strong> New replies are turned off by a moderator.</div>
      </div>
    );
  }
  if (!user) {
    return (
      <Card className="community-reply-form es-row es-row--between">
        <p>Log in to join the conversation.</p>
        <Link to="/login" className={buttonClass("primary")}><LogIn aria-hidden="true" /> Log in to reply</Link>
      </Card>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = lengthBetween(content, "Reply", LIMITS.reply.min, LIMITS.reply.max);
    setError(err);
    if (err) return;
    create.mutate(
      { postId, content, authorName: user.name },
      { onSuccess: () => { setContent(""); notify.success("Reply posted"); }, onError: () => notify.error("Couldn't post your reply", "Please try again.") },
    );
  };

  return (
    <Card as="section" className="community-reply-form" aria-labelledby="reply-form-title">
      <h3 id="reply-form-title" className="community-reply-form__title">Write a reply</h3>
      <form className="es-form" onSubmit={submit} noValidate>
        <TextAreaField label={`Reply as ${user.name}`} name="reply" required value={content} onChange={(e) => { setContent(e.target.value); if (error) setError(null); }} error={error ?? undefined} maxLength={LIMITS.reply.max} rows={4} />
        <div className="es-row es-row--end">
          <Button type="submit" loading={create.isPending}>Post reply</Button>
        </div>
      </form>
    </Card>
  );
}

function EditReplyModal({ reply, onClose }: { reply: ForumReply | null; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateReply();
  const [lastId, setLastId] = useState<string | null>(null);
  if (reply && reply.id !== lastId) {
    setLastId(reply.id);
    setContent(reply.content);
    setError(null);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!reply) return;
    const err = lengthBetween(content, "Reply", LIMITS.reply.min, LIMITS.reply.max);
    setError(err);
    if (err) return;
    update.mutate({ id: reply.id, content }, { onSuccess: () => { notify.success("Reply updated"); setLastId(null); onClose(); }, onError: () => notify.error("Couldn't save your reply") });
  };

  return (
    <Modal open={reply !== null} onOpenChange={(o) => { if (!o) { setLastId(null); onClose(); } }} title="Edit reply">
      <form className="es-form" onSubmit={submit} noValidate>
        <TextAreaField label="Reply" name="edit-reply" required value={content} onChange={(e) => setContent(e.target.value)} error={error ?? undefined} maxLength={LIMITS.reply.max} rows={5} />
        <div className="es-modal__foot">
          <Button variant="secondary" onClick={() => { setLastId(null); onClose(); }}>Cancel</Button>
          <Button type="submit" loading={update.isPending}>Save reply</Button>
        </div>
      </form>
    </Modal>
  );
}
