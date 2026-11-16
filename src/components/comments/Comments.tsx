import { useRef, useState, type FormEvent, type ReactNode, type Ref } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { MAX_COMMENT_LENGTH } from "../../api/comments";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  useComments,
  useCreateComment,
  useCreateReply,
  useDeleteComment,
  useReplies,
  useUpdateComment,
} from "../../hooks/comments";
import { displayName, formatDate } from "../../lib/format";
import type { Comment } from "../../types";
import { CommentLikeButton } from "../likes/CommentLikeButton";
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
  placeholder = "A line for the person who made this…",
  autoFocus,
  textareaRef,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  error?: string | null;
  submitLabel: string;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  textareaRef?: Ref<HTMLTextAreaElement>;
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
        ref={textareaRef}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={MAX_COMMENT_LENGTH + 40}
        placeholder={placeholder}
        autoFocus={autoFocus}
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
  onReply,
  postAuthorId,
  children,
}: {
  comment: Comment;
  postId: string;
  canEdit: boolean;
  canDelete: boolean;
  onChanged: (comment: Comment) => void;
  onRemoved: (id: string) => void;
  onReply?: () => void;
  postAuthorId?: string;
  children?: ReactNode;
}) {
  const update = useUpdateComment(postId);
  const remove = useDeleteComment(postId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [confirming, setConfirming] = useState(false);
  const name = displayName(comment.author);
  const isReply = Boolean(comment.parent_id);
  const isPostAuthor = Boolean(postAuthorId && comment.author_id === postAuthorId);

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
    <article className={isReply ? "border-l-2 border-ocean/50 bg-paper/70 px-4 py-3" : "border-l-2 border-mustard bg-card/80 px-5 py-4"}>
      <header className="flex items-start justify-between gap-4">
        <Link to={`/u/${comment.author_id}`} className="group flex min-w-0 items-center gap-3">
          <span
            className={`flex shrink-0 items-center justify-center rounded-full border-2 border-ink bg-mustard font-display font-semibold ${
              isReply ? "h-7 w-7 text-sm" : "h-9 w-9 text-base"
            }`}
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span
              className={`block truncate font-hand leading-none text-ocean group-hover:text-terracotta ${isReply ? "text-xl" : "text-2xl"}`}
            >
              {name}
            </span>
            {comment.author ? (
              <span className="font-mono text-[0.65rem] text-ink-faint">
                @{comment.author.username}
                {isPostAuthor ? <span className="ml-2 uppercase tracking-[0.16em] text-terracotta">· Author</span> : null}
              </span>
            ) : null}
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
        <p
          className={`mt-3 whitespace-pre-line font-display leading-relaxed text-ink/90 ${isReply ? "text-base" : "text-lg"}`}
        >
          {comment.content}
        </p>
      )}

      {!editing ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CommentLikeButton comment={comment} onChange={onChanged} />
          {onReply ? (
            <button
              type="button"
              onClick={onReply}
              className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint transition hover:text-ocean"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Reply
            </button>
          ) : null}
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
      {children}
    </article>
  );
}

function ignore() {}

function CommentThread({
  comment,
  postId,
  postAuthorId,
  onChanged,
  onRemoved,
}: {
  comment: Comment;
  postId: string;
  postAuthorId?: string;
  onChanged: (comment: Comment) => void;
  onRemoved: (id: string) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const replyBox = useRef<HTMLTextAreaElement>(null);
  const replies = useReplies(postId, comment.id, open);
  const create = useCreateReply(postId);
  const items = replies.data?.pages.flat() ?? [];
  const count = Math.max(comment.reply_count ?? 0, items.length);
  const canManage = (target: Comment) => Boolean(user && (user.id === target.author_id || user.is_admin));

  function startReply(target: Comment) {
    setOpen(true);
    setReplying(true);
    if (target.author) {
      const mention = `@${target.author.username} `;
      setDraft((current) => mention + current.replace(/^@\S+\s*/, ""));
    }
    requestAnimationFrame(() => {
      const box = replyBox.current;
      if (!box) return;
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    });
  }

  async function publish() {
    try {
      await create.mutateAsync({ parentId: comment.id, content: draft.trim() });
      setDraft("");
      setReplying(false);
      setOpen(true);
    } catch {
      // The composer shows create.error.
    }
  }

  return (
    <CommentNote
      comment={comment}
      postId={postId}
      postAuthorId={postAuthorId}
      canEdit={canManage(comment)}
      canDelete={canManage(comment)}
      onChanged={onChanged}
      onRemoved={onRemoved}
      onReply={user ? () => startReply(comment) : undefined}
    >
      {count > 0 ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ocean transition hover:text-terracotta"
        >
          {open ? "Hide replies" : `View ${count} ${count === 1 ? "reply" : "replies"}`}
        </button>
      ) : null}

      {open && (count > 0 || replies.isPending) ? (
        <div className="mt-4 space-y-3 border-l border-dashed border-ink/20 pl-4 sm:pl-6">
          {replies.isPending ? <Spinner label="Gathering replies…" /> : null}
          {replies.isError ? <FormError message={errorMessage(replies.error)} /> : null}
          {items.map((reply) => (
            <CommentNote
              key={reply.id}
              comment={reply}
              postId={postId}
              postAuthorId={postAuthorId}
              canEdit={canManage(reply)}
              canDelete={canManage(reply)}
              onChanged={ignore}
              onRemoved={ignore}
              onReply={user ? () => startReply(reply) : undefined}
            />
          ))}
          {replies.hasNextPage ? (
            <Button variant="ghost" size="sm" onClick={() => replies.fetchNextPage()} loading={replies.isFetchingNextPage}>
              More replies
            </Button>
          ) : null}
        </div>
      ) : null}

      {replying && user ? (
        <div className="pl-4 sm:pl-6">
          <NoteComposer
            label={`Reply to ${displayName(comment.author)}`}
            value={draft}
            onChange={setDraft}
            onSubmit={publish}
            pending={create.isPending}
            error={create.isError ? errorMessage(create.error) : null}
            submitLabel="Send the reply"
            placeholder="Write a reply…"
            autoFocus
            textareaRef={replyBox}
            onCancel={() => {
              setDraft("");
              setReplying(false);
            }}
          />
        </div>
      ) : null}
    </CommentNote>
  );
}

export function Comments({ postId, postAuthorId }: { postId: string; postAuthorId?: string }) {
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
          <CommentThread
            key={comment.id}
            comment={comment}
            postId={postId}
            postAuthorId={postAuthorId}
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
          <CommentThread
            key={comment.id}
            comment={comment}
            postId={postId}
            postAuthorId={postAuthorId}
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
