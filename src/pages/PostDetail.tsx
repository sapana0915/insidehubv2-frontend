import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { useDeletePost, usePost } from "../hooks/posts";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { categoryMeta } from "../lib/categories";
import { displayName, formatDate, paragraphs, readingTime } from "../lib/format";
import { StampBadge } from "../components/ui/StampBadge";
import { Postmark } from "../components/ui/Postmark";
import { Gallery } from "../components/posts/Gallery";
import { PostGrid } from "../components/posts/PostGrid";
import { EmptyState, RouteLine, Spinner } from "../components/ui/Decor";
import { Button, ButtonLink } from "../components/ui/Button";
import { FormError } from "../components/ui/Field";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: post, isPending, error } = usePost(id);
  const deletePost = useDeletePost();
  const [confirming, setConfirming] = useState(false);

  if (isPending) return <Spinner />;
  if (error || !post) {
    const notFound = axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 422);
    return (
      <div className="px-4 py-20">
        <EmptyState
          title={notFound ? "This postcard got lost in the mail." : "We couldn't open this entry."}
          action={<ButtonLink to="/explore">Back to the journal</ButtonLink>}
        >
          {notFound ? "It may have been deleted, or the link is wrong." : errorMessage(error)}
        </EmptyState>
      </div>
    );
  }

  const isOwner = Boolean(user && (user.id === post.author_id || user.is_admin));
  const meta = categoryMeta(post.category);
  const [cover, ...rest] = post.images;
  const body = paragraphs(post.content);

  async function onDelete() {
    await deletePost.mutateAsync(post!.id);
    navigate("/me", { replace: true });
  }

  return (
    <article className="pb-10">
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <button onClick={() => navigate(-1)} className="eyebrow inline-flex items-center gap-2 hover:text-terracotta">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        <header className="relative mt-8">
          <div className="flex flex-wrap items-center gap-4">
            <StampBadge slug={post.category} link size="md" />
            <span className="eyebrow">
              {formatDate(post.created_at, { day: "numeric", month: "long", year: "numeric" })} · {readingTime(post.content)} min read
            </span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
            <Link to={`/u/${post.author_id}`} className="group flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-mustard font-display text-lg font-semibold">
                {displayName(post.author).charAt(0).toUpperCase()}
              </span>
              <span>
                <span className="block font-hand text-2xl leading-none text-ocean group-hover:text-terracotta">{displayName(post.author)}</span>
                {post.author ? <span className="font-mono text-xs text-ink-faint">@{post.author.username}</span> : null}
              </span>
            </Link>
            <Postmark date={post.created_at} label={`${meta.name.toUpperCase()} · INSIDEHUB ·`} size={64} />
          </div>

          {isOwner ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to={`/p/${post.id}/edit`} variant="ghost" size="sm" icon={<Pencil className="h-3.5 w-3.5" />}>
                Edit
              </ButtonLink>
              {confirming ? (
                <>
                  <Button variant="danger" size="sm" loading={deletePost.isPending} onClick={onDelete}>
                    Yes, delete it
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Keep it
                  </Button>
                </>
              ) : (
                <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirming(true)}>
                  Delete
                </Button>
              )}
            </div>
          ) : null}
          {deletePost.isError ? (
            <div className="mt-4">
              <FormError message={errorMessage(deletePost.error)} />
            </div>
          ) : null}
        </header>
      </div>

      {cover ? (
        <figure className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
          <div className="postcard !p-3 md:!p-4" style={{ transform: "rotate(-0.6deg)" }}>
            <img src={cover.image_url} alt="" className="max-h-[70vh] w-full object-cover" />
          </div>
        </figure>
      ) : null}

      <div className="mx-auto mt-14 max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 font-display text-[1.22rem] leading-[1.75] text-ink/90">
          {body.map((p, i) => (
            <p key={i} className={`whitespace-pre-line ${i === 0 ? "drop-cap" : ""}`}>
              {p}
            </p>
          ))}
        </div>
        <p className="mt-12 text-right font-hand text-3xl text-ocean">— {displayName(post.author)}</p>
      </div>

      {rest.length > 0 ? (
        <section className="mx-auto mt-16 max-w-5xl px-4 sm:px-6">
          <p className="eyebrow mb-6">Contact sheet · {rest.length} more frames</p>
          <Gallery images={rest} />
        </section>
      ) : null}

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <RouteLine className="mb-10" />
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">More from {meta.name}</h2>
          <Link to={`/c/${meta.slug}`} className="eyebrow hover:text-terracotta">
            Open drawer →
          </Link>
        </div>
        <PostGrid
          filters={{ category: post.category }}
          pageSize={4}
          paginate={false}
          excludeId={post.id}
          empty={<p className="text-ink-soft">This is the only one so far.</p>}
        />
      </section>
    </article>
  );
}
