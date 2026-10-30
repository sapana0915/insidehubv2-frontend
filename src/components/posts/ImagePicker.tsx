import { useRef, useState } from "react";
import { ImagePlus, Link2, Star, X } from "lucide-react";
import { useUploadImage } from "../../hooks/posts";
import { errorMessage } from "../../api/client";
import { Button } from "../ui/Button";

const MAX_IMAGES = 12;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImagePickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function ImagePicker({ value, onChange }: ImagePickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const [urlDraft, setUrlDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);

  const remaining = MAX_IMAGES - value.length;

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const list = Array.from(files).slice(0, remaining);
    const added: string[] = [];
    setUploading(list.length);
    for (const file of list) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`${file.name}: only JPG, PNG, WEBP or GIF images are allowed.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name}: images must be under 5 MB.`);
        continue;
      }
      try {
        added.push(await upload.mutateAsync(file));
      } catch (err) {
        setError(errorMessage(err, `Couldn't upload ${file.name}.`));
      }
    }
    setUploading(0);
    if (added.length) onChange([...value, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      setError("That doesn't look like a valid image link.");
      return;
    }
    setError(null);
    onChange([...value, url]);
    setUrlDraft("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    const next = [...value];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  }

  return (
    <div>
      <span className="eyebrow">Photographs · {value.length}/{MAX_IMAGES}</span>

      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, i) => (
          <figure key={`${url}-${i}`} className="postcard group relative !p-2 !pb-2" style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
            <img src={url} alt="" className="aspect-square w-full object-cover" />
            {i === 0 ? (
              <figcaption className="absolute left-3 top-3 bg-terracotta px-2 py-0.5 font-mono text-[0.55rem] tracking-widest text-paper">
                COVER
              </figcaption>
            ) : null}
            <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              {i !== 0 ? (
                <button type="button" onClick={() => makeCover(i)} className="bg-paper p-1 text-ink shadow" aria-label="Use as cover">
                  <Star className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <button type="button" onClick={() => remove(i)} className="bg-paper p-1 text-terracotta-deep shadow" aria-label="Remove photo">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </figure>
        ))}

        {remaining > 0 ? (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading > 0}
            className="flex aspect-square flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/25 text-ink-soft transition hover:border-terracotta hover:text-terracotta disabled:opacity-60"
          >
            {uploading > 0 ? (
              <>
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-dashed border-terracotta" />
                <span className="eyebrow">Uploading {uploading}…</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-7 w-7" />
                <span className="eyebrow">Add photos</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {remaining > 0 ? (
        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1">
            <span className="eyebrow flex items-center gap-1">
              <Link2 className="h-3 w-3" /> or paste an image link
            </span>
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="https://…"
              className="w-full border-0 border-b-2 border-ink/25 bg-transparent py-2 focus:border-terracotta focus:outline-none"
            />
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={addUrl}>
            Pin it
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-terracotta-deep">{error}</p> : null}
    </div>
  );
}
