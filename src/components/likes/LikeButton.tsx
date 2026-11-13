import { Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLikes, useToggleLike } from "../../hooks/likes";

function likesLabel(count: number) {
  return `${count} ${count === 1 ? "like" : "likes"}`;
}

export function LikeButton({ postId }: { postId: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const likes = useLikes(postId);
  const toggle = useToggleLike(postId);

  const liked = likes.data?.liked ?? false;
  const count = likes.data?.like_count;
  const ready = likes.isSuccess;
  const next = encodeURIComponent(`${location.pathname}${location.search}`);

  const shell = `inline-flex items-center gap-2.5 border-2 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition ${
    liked
      ? "border-terracotta bg-terracotta text-paper shadow-[3px_3px_0_var(--color-ink)]"
      : "border-ink/40 bg-card text-ink hover:border-terracotta hover:text-terracotta"
  }`;

  const heart = <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} aria-hidden />;
  const caption = ready && count !== undefined ? likesLabel(count) : null;
  const tally = ready && count !== undefined ? String(count) : "…";

  return (
    <div>
      {user ? (
        <button
          type="button"
          className={`${shell} disabled:pointer-events-none disabled:opacity-50`}
          disabled={!ready || toggle.isPending}
          aria-pressed={liked}
          aria-label={caption ? (liked ? `Unlike this post, ${caption}` : `Like this post, ${caption}`) : "Like this post"}
          onClick={() => toggle.mutate(liked)}
        >
          {heart}
          {liked ? "Liked" : "Like"}
          <span className="text-current/80">{tally}</span>
        </button>
      ) : (
        <Link to={`/login?next=${next}`} className={shell} aria-label={caption ? `Sign in to like this post, ${caption}` : "Sign in to like this post"}>
          {heart}
          Like
          <span className="text-current/80">{tally}</span>
        </Link>
      )}
      {toggle.isError ? <p className="mt-2 text-xs text-terracotta-deep">{errorMessage(toggle.error)}</p> : null}
      {likes.isError ? <p className="mt-2 text-xs text-terracotta-deep">{errorMessage(likes.error)}</p> : null}
    </div>
  );
}
