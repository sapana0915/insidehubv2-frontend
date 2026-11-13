import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToggleCommentLike } from "../../hooks/comments";
import type { Comment } from "../../types";

export function CommentLikeButton({
  comment,
  onChange,
}: {
  comment: Comment;
  onChange: (comment: Comment) => void;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const toggle = useToggleCommentLike(comment.post_id);
  const liked = Boolean(comment.liked);
  const count = comment.like_count ?? 0;
  const next = encodeURIComponent(`${location.pathname}${location.search}`);
  const label = `${count} ${count === 1 ? "like" : "likes"}`;

  const shell = `inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition ${
    liked ? "text-terracotta" : "text-ink-faint hover:text-terracotta"
  }`;
  const heart = <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} aria-hidden />;

  async function onClick() {
    const previous = comment;
    onChange({
      ...comment,
      liked: !liked,
      like_count: Math.max(0, count + (liked ? -1 : 1)),
    });
    try {
      const status = await toggle.mutateAsync({ id: comment.id, liked, likeCount: count });
      onChange({ ...comment, liked: status.liked, like_count: status.like_count });
    } catch {
      onChange(previous);
    }
  }

  return (
    <div>
      {user ? (
        <button
          type="button"
          className={`${shell} disabled:opacity-50`}
          disabled={toggle.isPending}
          aria-pressed={liked}
          aria-label={liked ? `Unlike this comment, ${label}` : `Like this comment, ${label}`}
          onClick={onClick}
        >
          {heart}
          {count}
        </button>
      ) : (
        <Link to={`/login?next=${next}`} className={shell} aria-label={`Sign in to like this comment, ${label}`}>
          {heart}
          {count}
        </Link>
      )}
      {toggle.isError ? <p className="mt-2 text-xs text-terracotta-deep">{errorMessage(toggle.error)}</p> : null}
    </div>
  );
}
