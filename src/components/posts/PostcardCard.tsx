import { Link } from "react-router-dom";
import { Images } from "lucide-react";
import type { Post } from "../../types";
import { displayName, excerpt, formatDate, readingTime, tiltFor } from "../../lib/format";
import { categoryMeta } from "../../lib/categories";
import { StampBadge } from "../ui/StampBadge";

export function PostcardCard({ post, index = 0 }: { post: Post; index?: number }) {
  const cover = post.images[0]?.image_url;
  const meta = categoryMeta(post.category);

  return (
    <article className="postcard group relative mb-8 break-inside-avoid" style={{ transform: `rotate(${tiltFor(index)}deg)` }}>
      <Link to={`/p/${post.id}`} className="block focus-visible:outline-none" aria-label={post.title}>
        {cover ? (
          <div className="relative overflow-hidden bg-paper-deep">
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full object-cover saturate-[0.85] sepia-[0.12] transition duration-500 group-hover:scale-[1.03] group-hover:saturate-100 group-hover:sepia-0"
            />
            {post.images.length > 1 ? (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-ink/75 px-2 py-1 font-mono text-[0.6rem] tracking-widest text-paper">
                <Images className="h-3 w-3" /> {post.images.length}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="lined-paper relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-ink/10">
            <span className="font-display text-[7rem] font-semibold italic leading-none" style={{ color: meta.color, opacity: 0.85 }}>
              {post.title.trim().charAt(0).toUpperCase()}
            </span>
            <span className="absolute right-3 top-3 font-mono text-[0.6rem] tracking-[0.3em] text-ink-faint">{meta.code}</span>
          </div>
        )}

        <div className="px-1 pt-4">
          <div className="flex items-center justify-between gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint">
            <span>{formatDate(post.created_at)}</span>
            <span>{readingTime(post.content)} min read</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink decoration-terracotta decoration-2 underline-offset-4 group-hover:underline">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{excerpt(post.content, 150)}</p>
        </div>
      </Link>

      <div className="mt-4 flex items-end justify-between px-1">
        <Link to={`/u/${post.author_id}`} className="font-hand text-2xl leading-none text-ocean hover:text-terracotta">
          — {displayName(post.author)}
        </Link>
      </div>

      <div className="absolute -right-3 -top-3">
        <StampBadge slug={post.category} link tilt={index % 2 ? 4 : -4} />
      </div>
    </article>
  );
}
