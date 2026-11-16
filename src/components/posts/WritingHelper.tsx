import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronUp, Sparkles } from "lucide-react";
import { useDraftPost, useDraftUsage } from "../../hooks/ai";
import { errorMessage } from "../../api/client";
import type { DraftLength, DraftTone, DraftUsage } from "../../types";
import { FormError, Input, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";

const MIN_NOTES_LENGTH = 20;
const MAX_METER_DOTS = 12;

const selectClass =
  "mt-2 w-full border-0 border-b-2 border-ink/25 bg-transparent py-2 text-ink focus:border-terracotta focus:outline-none";

function resetTime(): string {
  const next = new Date();
  next.setUTCHours(24, 0, 0, 0);
  return next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function UsageMeter({ usage }: { usage: DraftUsage }) {
  return (
    <div className="flex items-center gap-3" aria-label={`${usage.remaining} of ${usage.limit} drafts left today`}>
      {usage.limit <= MAX_METER_DOTS ? (
        <div className="flex gap-1">
          {Array.from({ length: usage.limit }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i < usage.remaining ? "bg-terracotta" : "bg-ink/15"}`}
            />
          ))}
        </div>
      ) : null}
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft">
        {usage.remaining} of {usage.limit} drafts left today
      </span>
    </div>
  );
}

interface WritingHelperProps {
  category: string;
  title: string;
  content: string;
  onDraft: (title: string, content: string) => void;
}

export function WritingHelper({ category, title, content, onDraft }: WritingHelperProps) {
  const [open, setOpen] = useState(false);
  const usage = useDraftUsage();
  const draftPost = useDraftPost();
  const [notes, setNotes] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("");
  const [detail, setDetail] = useState("");
  const [feeling, setFeeling] = useState("");
  const [length, setLength] = useState<DraftLength>("medium");
  const [tone, setTone] = useState<DraftTone>("warm");
  const [error, setError] = useState<string | null>(null);
  const lastDraft = useRef<{ title: string; content: string } | null>(null);

  const remaining = usage.data?.remaining;
  const outOfDrafts = remaining === 0;
  const drafted = lastDraft.current !== null;
  const editedByHand =
    Boolean(title.trim() || content.trim()) &&
    (lastDraft.current === null || lastDraft.current.title !== title || lastDraft.current.content !== content);

  async function generate() {
    setError(null);
    if (notes.trim().length < MIN_NOTES_LENGTH) {
      setError("Tell a little more about what happened. A sentence or two is enough.");
      return;
    }
    if (editedByHand && !window.confirm("Replace your title and story with a new draft?")) {
      return;
    }
    try {
      const draft = await draftPost.mutateAsync({
        category,
        notes: notes.trim(),
        where: where.trim() || undefined,
        when: when.trim() || undefined,
        who: who.trim() || undefined,
        detail: detail.trim() || undefined,
        feeling: feeling.trim() || undefined,
        length,
        tone,
      });
      lastDraft.current = { title: draft.title, content: draft.content };
      onDraft(draft.title, draft.content);
    } catch (err) {
      setError(errorMessage(err, "Couldn't draft this entry."));
    }
  }

  // This panel sits inside the editor's <form>; Enter in a single-line field must not post the entry.
  function blockEnter(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-ink/25 px-5 py-4">
        <div className="space-y-2">
          <p className="text-sm text-ink-soft">Not sure how to start? Jot down what happened and get a first draft to edit.</p>
          {usage.data ? <UsageMeter usage={usage.data} /> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<Sparkles className="h-3.5 w-3.5" />}
          onClick={() => setOpen(true)}
        >
          Help me write this
        </Button>
      </div>
    );
  }

  return (
    <div onKeyDown={blockEnter} className="space-y-6 border border-ink/15 px-5 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Writing helper</p>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Write it the way you'd tell a friend. Only what you write here goes into the draft, so the more you
            share, the richer the story.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Hide
        </button>
      </div>

      {usage.data ? <UsageMeter usage={usage.data} /> : null}

      <FormError message={error} />

      <Textarea
        label="What happened"
        name="ai-notes"
        rows={5}
        maxLength={4000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Went to Jaipur with my sister. Ate dal baati near the fort. The morning was cold and we got lost twice."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Place (optional)" name="ai-where" maxLength={200} value={where} onChange={(e) => setWhere(e.target.value)} />
        <Input label="When (optional)" name="ai-when" maxLength={200} value={when} onChange={(e) => setWhen(e.target.value)} />
        <Input label="Who was there (optional)" name="ai-who" maxLength={200} value={who} onChange={(e) => setWho(e.target.value)} />
        <Input label="How it felt (optional)" name="ai-feeling" maxLength={300} value={feeling} onChange={(e) => setFeeling(e.target.value)} />
      </div>
      <Input
        label="One detail you remember (optional)"
        name="ai-detail"
        maxLength={500}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Length</span>
          <select value={length} onChange={(e) => setLength(e.target.value as DraftLength)} className={selectClass}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Tone</span>
          <select value={tone} onChange={(e) => setTone(e.target.value as DraftTone)} className={selectClass}>
            <option value="warm">Warm</option>
            <option value="simple">Simple</option>
            <option value="lively">Lively</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-ink/10 pt-5">
        {outOfDrafts ? (
          <p className="text-sm text-ink-soft">
            You've used today's drafts. They reset at {resetTime()}. You can still write and edit the story yourself.
          </p>
        ) : (
          <Button
            type="button"
            loading={draftPost.isPending}
            icon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={generate}
          >
            {drafted ? "Try another version" : "Draft my entry"}
          </Button>
        )}
        {draftPost.isPending ? <p className="text-sm text-ink-soft">Writing your draft. This can take a few seconds…</p> : null}
        {drafted && !draftPost.isPending ? (
          <p className="text-sm text-ocean">
            Your draft is in the title and story below. Change anything you like before you post.
          </p>
        ) : null}
      </div>
    </div>
  );
}
