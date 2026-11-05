import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useCreatePost, usePost, useUpdatePost } from "../hooks/posts";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { CATEGORIES, PHOTOGRAPHY_SLUG } from "../lib/categories";
import { readingTime } from "../lib/format";
import { ImagePicker, type DraftImage } from "../components/posts/ImagePicker";
import { Textarea, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Decor";

export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const existing = usePost(id);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(id ?? "");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("travel-stories");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!isEdit);

  useEffect(() => {
    if (isEdit && existing.data && !hydrated) {
      setTitle(existing.data.title);
      setContent(existing.data.content);
      setCategory(existing.data.category);
      setImages(existing.data.images.map((i) => ({ url: i.image_url, placeName: i.place_name ?? "" })));
      setHydrated(true);
    }
  }, [isEdit, existing.data, hydrated]);

  if (isEdit && existing.isPending) return <Spinner />;
  if (isEdit && existing.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <FormError message={errorMessage(existing.error)} />
      </div>
    );
  }
  if (isEdit && existing.data && user && existing.data.author_id !== user.id && !user.is_admin) {
    return <Navigate to={`/p/${id}`} replace />;
  }

  const saving = createPost.isPending || updatePost.isPending;
  const isPhoto = category === PHOTOGRAPHY_SLUG;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (isPhoto) {
      if (images.length === 0) {
        setError("Add at least one photo.");
        return;
      }
    } else if (!title.trim() || !content.trim()) {
      setError("Every entry needs a title and a story.");
      return;
    }
    const payload = isPhoto
      ? {
          title: "",
          content: "",
          category,
          images: images.map((image) => ({
            url: image.url,
            place_name: image.placeName.trim() || null,
          })),
        }
      : {
          title: title.trim(),
          content: content.trim(),
          category,
          images: images.map((image) => ({ url: image.url })),
        };
    try {
      const post = isEdit ? await updatePost.mutateAsync(payload) : await createPost.mutateAsync(payload);
      navigate(`/p/${post.id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't save this entry."));
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="eyebrow">{isEdit ? "Revising an entry" : isPhoto ? "New photograph" : "New journal entry"}</p>
          <p className="mt-1 font-hand text-2xl text-ocean">
            {isPhoto
              ? `${images.length} photo${images.length === 1 ? "" : "s"}`
              : content.trim()
                ? `${readingTime(content)} min read · ${images.length} photo${images.length === 1 ? "" : "s"}`
                : "dear diary…"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} icon={<Send className="h-3.5 w-3.5" />}>
            {isEdit ? "Save changes" : "Post it"}
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        <FormError message={error} />

        <fieldset>
          <legend className="eyebrow">Drawer</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.slug;
              return (
                <label
                  key={c.slug}
                  className={`stamp cursor-pointer transition ${active ? "-rotate-2 scale-110" : "opacity-55 hover:opacity-90"}`}
                  style={{ "--stamp-color": c.color } as CSSProperties}
                >
                  <input
                    type="radio"
                    name="category"
                    value={c.slug}
                    checked={active}
                    onChange={() => setCategory(c.slug)}
                    className="sr-only"
                  />
                  <Icon className="h-3 w-3" />
                  {c.name}
                </label>
              );
            })}
          </div>
          {isPhoto ? (
            <p className="mt-4 max-w-xl text-sm text-ink-soft">
              Photography is photos only. Add a place name under a picture if you want. It is optional.
            </p>
          ) : null}
        </fieldset>

        {isPhoto ? null : (
        <label className="block">
          <span className="sr-only">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Give it a headline…"
            className="w-full border-0 bg-transparent font-display text-4xl font-semibold tracking-tight placeholder:text-ink-faint/70 focus:outline-none md:text-6xl"
          />
          <span className="mt-1 block text-right font-mono text-[0.6rem] text-ink-faint">{title.length}/200</span>
        </label>
        )}

        <ImagePicker value={images} onChange={setImages} placeNames={isPhoto} />

        {isPhoto ? null : (
        <Textarea
          label="The story"
          name="content"
          rows={16}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Where were you? What did it smell like? Leave a blank line between paragraphs."
          hint="Plain text. A blank line starts a new paragraph."
        />
        )}

        <div className="flex justify-end gap-3 border-t border-ink/10 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={saving} icon={<Send className="h-3.5 w-3.5" />}>
            {isEdit ? "Save changes" : "Post it"}
          </Button>
        </div>
      </div>
    </form>
  );
}
