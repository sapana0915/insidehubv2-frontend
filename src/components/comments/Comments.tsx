import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { MAX_COMMENT_LENGTH } from "../../api/comments";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "../../hooks/comments";
import { displayName, formatDate } from "../../lib/format";
import type { Comment } from "../../types";
import { Button, ButtonLink } from "../ui/Button";
import { Spinner } from "../ui/Decor";
import { FormError, Textarea } from "../ui/Field";

function wasEdited(comment: Comment) {
  return new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 2000;
}

function NoteComposer({
  label,
  value,
  onChange,
  onSubmit,
  pending,
  error,
  submitLabel,
  onCancel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  error?: string | null;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const remaining = MAX_COMMENT_LENGTH - value.trim().length;
  const tooLong = remaining < 0;
  const empty = value.trim().length === 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (empty || tooLong || pending) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Textarea
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={MAX_COMMENT_LENGTH + 40}
        placeholder="A line for the person who made this…"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            if (!empty && !tooLong && !pending) onSubmit();
          }
        }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className={`font-mono text-[0.65rem] tracking-wide ${tooLong ? "text-terracotta-deep" : "text-ink-faint"}`}>
          {value.trim().length} / {MAX_COMMENT_LENGTH}
        </span>
        <div className="flex gap-3">
          {onCancel ? (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" loading={pending} disabled={empty || tooLong}>
            {submitLabel}
          </Button>
        </div>
      </div>
      {error ? (
        <div className="mt-3">
          <FormError message={error} />
        </div>
      ) : null}
    </form>
  );
}

function CommentNote({
  comment,
  postId,
  canEdit,
  canDelete,
  onChanged,
  onRemoved,
}: {
  comment: Comment;
  postId: string;
  canEdit: boolean;
  canDelete: boolean;
  onChanged: (comment: Comment) => void;
  onRemoved: (id: string) => void;
}) {
  const update = useUpdateComment(postId);
  const remove = useDeleteComment(postId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [confirming, setConfirming] = useState(false);
  const name = displayName(comment.author);

  async function save() {
    try {
      const next = await update.mutateAsync({ id: comment.id, content: draft.trim() });
      onChanged(next);
      setEditing(false);
    } catch {
      // The composer shows update.error.
    }
  }

  async function destroy() {
    try {
      await remove.mutateAsync(comment.id);
      onRemoved(comment.id);
    } catch {
      // The note shows remove.error.
    }
  }

  return (
    <article className="border-l-2 border-mustard bg-card/80 px-5 py-4">
      <header className="flex items-start justify-between gap-4">
        <Link to={`/u/${comment.author_id}`} className="group flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mustard font-display text-base font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-hand text-2xl leading-none text-ocean group-hover:text-terracotta">{name}</span>
            {comment.author ? <span className="font-mono text-[0.65rem] text-ink-faint">@{comment.author.username}</span> : null}
          </span>
        </Link>
        <time className="shrink-0 pt-1 font-mono text-[0.65rem] tracking-wide text-ink-faint" dateTime={comment.created_at}>
          {formatDate(comment.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {wasEdited(comment) ? " · edited" : ""}
        </time>
      </header>

      {editing ? (
        <NoteComposer
          label="Rewrite"
          value={draft}
          onChange={setDraft}
          onSubmit={save}
          pending={update.isPending}
          error={update.isError ? errorMessage(update.error) : null}
          submitLabel="Save the note"
          onCancel={() => {
            setDraft(comment.content);
            setEditing(false);
          }}
        />
      ) : (
        <p className="mt-3 whitespace-pre-line font-display text-lg leading-relaxed text-ink/90">{comment.content}</p>
      )}

      {!editing && (canEdit || canDelete) ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {canEdit ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                setDraft(comment.content);
                setConfirming(false);
                setEditing(true);
              }}
            >
              Edit
            </Button>
          ) : null}
          {canDelete ? (
            confirming ? (
              <>
                <Button variant="danger" size="sm" loading={remove.isPending} onClick={destroy}>
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
            )
          ) : null}
        </div>
      ) : null}
      {remove.isError ? (
        <div className="mt-3">
          <FormError message={errorMessage(remove.error)} />
        </div>
      ) : null}
    </article>
  );
}

export function Comments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const feed = useComments(postId);
  const create = useCreateComment(postId);
  const [draft, setDraft] = useState("");
  const [fresh, setFresh] = useState<Comment[]>([]);

  const loaded = feed.data?.pages.flat() ?? [];
  const loadedIds = new Set(loaded.map((comment) => comment.id));
  const pendingNotes = fresh.filter((comment) => !loadedIds.has(comment.id));
  const notes = loaded.length + pendingNotes.length;
  const next = encodeURIComponent(`${location.pathname}${location.search}`);

  async function publish() {
    try {
      const comment = await create.mutateAsync(draft.trim());
      setFresh((current) => [...current.filter((item) => item.id !== comment.id), comment]);
      setDraft("");
    } catch {
      // The composer shows create.error.
    }
  }

  return (
    <section className="mx-auto mt-16 max-w-2xl px-4 sm:px-6" aria-labelledby="margin-notes">
      <div className="flex items-end justify-between gap-4">
        <div>
          {/* <p className="eyebrow">Correspondence</p> */}
          <h2 id="margin-notes" className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Comments
          </h2>
        </div>
        {notes > 0 ? (
          <p className="eyebrow">
            {notes}
            {feed.hasNextPage ? "+" : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-8 space-y-4">
        {feed.isPending ? <Spinner label="Gathering notes…" /> : null}
        {feed.isError ? <FormError message={errorMessage(feed.error)} /> : null}
        {!feed.isPending && !feed.isError && notes === 0 ? (
          <p className="font-hand text-3xl text-ocean">The margin is still blank.</p>
        ) : null}
        {loaded.map((comment) => (
          <CommentNote
            key={comment.id}
            comment={comment}
            postId={postId}
            canEdit={Boolean(user && (user.id === comment.author_id || user.is_admin))}
            canDelete={Boolean(user && (user.id === comment.author_id || user.is_admin))}
            onChanged={(next) => setFresh((current) => current.map((item) => (item.id === next.id ? next : item)))}
            onRemoved={(id) => setFresh((current) => current.filter((item) => item.id !== id))}
          />
        ))}
        {feed.hasNextPage ? (
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => feed.fetchNextPage()} loading={feed.isFetchingNextPage}>
              Later notes
            </Button>
          </div>
        ) : null}
        {pendingNotes.map((comment) => (
          <CommentNote
            key={comment.id}
            comment={comment}
            postId={postId}
            canEdit={Boolean(user && (user.id === comment.author_id || user.is_admin))}
            canDelete={Boolean(user && (user.id === comment.author_id || user.is_admin))}
            onChanged={(next) => setFresh((current) => current.map((item) => (item.id === next.id ? next : item)))}
            onRemoved={(id) => setFresh((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-dashed border-ink/20 pt-6">
        {user ? (
          <NoteComposer
            label="Leave a comment"
            value={draft}
            onChange={setDraft}
            onSubmit={publish}
            pending={create.isPending}
            error={create.isError ? errorMessage(create.error) : null}
            submitLabel="Send the note"
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-ink/25 bg-card/50 px-5 py-5">
            <p className="font-display text-lg text-ink-soft">Sign in to leave a note on this page.</p>
            <ButtonLink to={`/login?next=${next}`} size="sm">
              Sign in
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
