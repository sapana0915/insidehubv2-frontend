import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PostImage } from "../../types";

export function Gallery({ images }: { images: PostImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            className="postcard !p-2 !pb-6 text-left"
            style={{ transform: `rotate(${[-2, 1.5, -1, 2, -1.5][i % 5]}deg)` }}
          >
            <img src={img.image_url} alt={`Photo ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="mt-2 block text-center font-hand text-lg text-ink-soft">frame {String(i + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <motion.figure
              key={open}
              initial={{ scale: 0.94, rotate: -2, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              className="bg-card p-3 pb-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={images[open].image_url} alt="" className="max-h-[78vh] max-w-[88vw] object-contain" />
              <figcaption className="mt-3 text-center font-mono text-xs tracking-widest text-ink-soft">
                {open + 1} / {images.length}
              </figcaption>
            </motion.figure>
            <button className="absolute right-5 top-5 text-paper" onClick={close} aria-label="Close">
              <X className="h-7 w-7" />
            </button>
            {images.length > 1 ? (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-paper"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-9 w-9" />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-paper"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-9 w-9" />
                </button>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
