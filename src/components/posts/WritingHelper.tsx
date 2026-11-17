import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronUp, Globe, Sparkles } from "lucide-react";
import { useDraftPost, useDraftUsage } from "../../hooks/ai";
import { errorMessage } from "../../api/client";
import type { DraftLength, DraftSource, DraftTone, DraftUsage } from "../../types";
import { FormError, Input, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import { plainTextToHtml, stripHtml } from "../../lib/html";

const MIN_PROMPT_LENGTH = 10;
const MAX_METER_DOTS = 12;

const PROMPT_EXAMPLES: Record<string, string> = {
  "travel-stories":
    "My first solo trip to Goa last month. I was nervous at the airport, rented a scooter, and spent most evenings at Palolem beach watching the sunset.",
  food: "The dal baati I ate near Amber Fort in Jaipur. Heavy, full of ghee, we ate it with our hands and had to sit for a while after.",
  culture: "Ganesh Chaturthi in our building this year. Everyone cooked modak together and the kids carried the idol down on the last day.",
  adventure: "Trekking to Triund last weekend. The last stretch was steep and rocky, my legs were shaking, but the view of the snow peaks was worth it.",
  lifestyle: "My new habit of a 20 minute walk without my phone every morning. I notice more and I'm calmer at work.",
  tech: "Review of my Kindle Paperwhite after 3 months. Great for trains, battery lasts weeks, but the store is annoying to browse.",
  art: "A watercolour of my grandmother's garden I painted over two weekends. The greens kept turning muddy until I let layers dry.",
  other: "What I learned from my first year of living alone in Pune.",
};

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
  const [prompt, setPrompt] = useState("");
  const [length, setLength] = useState<DraftLength>("medium");
  const [tone, setTone] = useState<DraftTone>("warm");
  const [newsMode, setNewsMode] = useState(false);
  const [sources, setSources] = useState<DraftSource[]>([]);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastDraft = useRef<{ title: string; content: string } | null>(null);

  const outOfDrafts = usage.data?.remaining === 0;
  const searchAvailable = usage.data?.web_search_categories.includes(category) ?? false;
  const useWebSearch = searchAvailable && newsMode;
  const drafted = lastDraft.current !== null;
  const editedByHand =
    Boolean(title.trim() || stripHtml(content)) &&
    (lastDraft.current === null ||
      lastDraft.current.title !== title ||
      stripHtml(lastDraft.current.content) !== stripHtml(content));

  function startOver() {
    setQuestions(null);
    setAnswers([]);
    setError(null);
  }

  async function generate() {
    setError(null);
    if (prompt.trim().length < MIN_PROMPT_LENGTH) {
      setError("Tell us a little about what you want to write.");
      return;
    }
    const answered = (questions ?? [])
      .map((question, i) => ({ question, answer: (answers[i] ?? "").trim() }))
      .filter((item) => item.answer);
    if (questions && answered.length === 0) {
      setError("Answer at least one question so the draft has something real to work with.");
      return;
    }
    if (editedByHand && !window.confirm("Replace your title and story with a new draft?")) {
      return;
    }
    try {
      const result = await draftPost.mutateAsync({
        category,
        prompt: prompt.trim(),
        answers: answered,
        length,
        tone,
        use_web_search: useWebSearch,
      });
      if (result.status === "questions") {
        setQuestions(result.questions);
        setAnswers(result.questions.map(() => ""));
        return;
      }
      const draft = {
        title: result.title ?? "",
        content: plainTextToHtml(result.content ?? ""),
      };
      lastDraft.current = draft;
      onDraft(draft.title, draft.content);
      setSources(result.sources);
      setQuestions(null);
      setAnswers([]);
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
          <p className="text-sm text-ink-soft">Not sure how to start? Tell us what it's about and get a first draft to edit.</p>
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
            Write it the way you'd tell a friend. Only what you share goes into the post, so include what
            happened, what you noticed, and how it felt.
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
        label="What do you want to write about?"
        name="ai-prompt"
        rows={5}
        maxLength={4000}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={PROMPT_EXAMPLES[category] ?? PROMPT_EXAMPLES.other}
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

      {searchAvailable ? (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={newsMode}
            onChange={(e) => setNewsMode(e.target.checked)}
            className="mt-1 h-4 w-4 accent-terracotta"
          />
          <span>
            <span className="inline-flex items-center gap-1.5 text-sm text-ink">
              <Globe className="h-3.5 w-3.5" />
              Write about a news event
            </span>
            <span className="mt-0.5 block text-xs text-ink-faint">
              Looks up public information on the web and lists the sources at the end of the story. Takes up to a
              minute. Check the facts before you post.
            </span>
          </span>
        </label>
      ) : null}

      {questions ? (
        <div className="space-y-5 border-l-4 border-ocean/40 pl-5">
          <p className="text-sm text-ink-soft">
            A few quick questions so the post sounds like you. Answer the ones you can, skip the rest.
          </p>
          {questions.map((question, i) => (
            <Input
              key={question}
              label={question}
              name={`ai-answer-${i}`}
              maxLength={1000}
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))}
            />
          ))}
        </div>
      ) : null}

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
            {questions ? "Write my draft" : drafted ? "Try another version" : "Draft my entry"}
          </Button>
        )}
        {questions && !draftPost.isPending ? (
          <button
            type="button"
            onClick={startOver}
            className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
          >
            Change my request
          </button>
        ) : null}
        {draftPost.isPending ? (
          <p className="text-sm text-ink-soft">
            {useWebSearch
              ? "Searching the web and writing your draft. This can take up to a minute…"
              : "Working on it. This can take a few seconds…"}
          </p>
        ) : null}
        {drafted && !questions && !draftPost.isPending ? (
          <p className="text-sm text-ocean">
            Your draft is in the title and story below. Change anything you like before you post.
          </p>
        ) : null}
      </div>

      {sources.length > 0 && !draftPost.isPending ? (
        <div className="border-t border-ink/10 pt-4">
          <p className="eyebrow">Sources used</p>
          <ul className="mt-2 space-y-1">
            {sources.map((source) => (
              <li key={source.url} className="text-sm">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean underline decoration-ocean/40 underline-offset-2 hover:decoration-ocean"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-faint">
            These are also listed at the end of the story. Open them to check the facts before posting.
          </p>
        </div>
      ) : null}
    </div>
  );
}
