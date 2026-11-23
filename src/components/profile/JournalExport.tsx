import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { errorMessage } from "../../api/client";
import { useExportMyWork } from "../../hooks/users";
import { Button } from "../ui/Button";
import { FormError } from "../ui/Field";

interface JournalExportProps {
  username: string;
  postCount?: number;
}

/** Departure-style panel: take a PDF copy of your journal entries. */
export function JournalExport({ username, postCount }: JournalExportProps) {
  const exportWork = useExportMyWork();
  const { isSuccess, reset } = exportWork;
  const [justSaved, setJustSaved] = useState(false);
  const entries = postCount ?? 0;
  const empty = entries === 0;

  useEffect(() => {
    if (!isSuccess) return;
    setJustSaved(true);
    const timer = window.setTimeout(() => {
      setJustSaved(false);
      reset();
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [isSuccess, reset]);

  async function onDownload() {
    exportWork.reset();
    try {
      await exportWork.mutateAsync(username);
    } catch {
      // surfaced via exportWork.error
    }
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative overflow-hidden bg-card shadow-[var(--shadow-postcard)]"
      aria-labelledby="journal-export-title"
    >
      <div className="flex items-center justify-between border-b border-dashed border-ink/15 bg-ink px-5 py-3 text-paper">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-paper/70">
          Customs · Departure
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-mustard">
          Keep copy
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <motion.div
          aria-hidden
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto flex h-20 w-16 flex-col items-center justify-center border-2 border-dashed border-ink/25 bg-paper-deep text-terracotta sm:mx-0"
        >
          <FileText className="h-7 w-7" strokeWidth={1.5} />
          <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.18em]">PDF</span>
        </motion.div>

        <div>
          <p className="eyebrow">Souvenir folio</p>
          <h2 id="journal-export-title" className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Take your journal with you
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {empty
              ? "No entries yet — you can still download a cover page, or write something first so the folio has a story to hold."
              : "A PDF of every entry you've posted here. Keep a copy if you leave the organisation — your posts stay public; this file is yours."}
          </p>

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            <div>
              <dt className="text-ink/40">Passenger</dt>
              <dd className="text-ink">@{username}</dd>
            </div>
            <div>
              <dt className="text-ink/40">Entries packed</dt>
              <dd className="text-terracotta">{entries}</dd>
            </div>
          </dl>

          <FormError
            message={
              exportWork.isError
                ? exportWork.error instanceof Error
                  ? exportWork.error.message
                  : errorMessage(exportWork.error)
                : null
            }
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ink"
              size="sm"
              loading={exportWork.isPending}
              icon={<Download className="h-3.5 w-3.5" />}
              onClick={onDownload}
            >
              {exportWork.isPending ? "Printing folio…" : "Download PDF"}
            </Button>

            <AnimatePresence>
              {justSaved ? (
                <motion.p
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-hand text-xl text-sage"
                >
                  Packed and ready.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="border-t border-dashed border-ink/15 px-5 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ink/35">
        Folio · InsideHub · Personal archive
      </p>
    </motion.aside>
  );
}
