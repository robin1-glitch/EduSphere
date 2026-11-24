import { Link } from "@tanstack/react-router";
import { CalendarDays, MessageSquare, User } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge, PinnedBadge, StatusBadge } from "@/components/common/Badge";
import type { ForumPost } from "@/lib/api/forum";
import { plural, timeAgo } from "@/lib/format";

export function PostCard({ post, showModeration }: { post: ForumPost; showModeration: boolean }) {
  const cls = ["community-post-card", post.is_pinned ? "community-post-card--pinned" : "", post.status === "Hidden" ? "community-post-card--hidden" : ""].filter(Boolean).join(" ");
  return (
    <Card as="li" interactive className={cls}>
      <div className="community-post-card__badges">
        {post.is_pinned ? <PinnedBadge /> : null}
        <Badge>{post.category}</Badge>
        {post.status !== "Open" || showModeration ? <StatusBadge status={post.status} /> : null}
      </div>
      <h3 className="community-post-card__title">
        <Link to="/community/$id" params={{ id: post.id }}>{post.title}</Link>
      </h3>
      <p className="community-post-card__excerpt">{post.content}</p>
      <div className="community-post-card__foot">
        <div className="es-meta">
          <span className="es-meta__item"><User aria-hidden="true" />{post.author_name}</span>
          <span className="es-meta__item"><CalendarDays aria-hidden="true" /><time dateTime={post.created_at}>{timeAgo(post.created_at)}</time></span>
        </div>
        <span className="community-reply-count"><MessageSquare aria-hidden="true" />{plural(post.reply_count, "reply", "replies")}</span>
      </div>
    </Card>
  );
}
