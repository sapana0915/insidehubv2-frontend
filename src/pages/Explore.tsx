import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { categoryMeta } from "../lib/categories";
import { useAuth } from "../context/AuthContext";
import { CategoryRail } from "../components/posts/CategoryRail";
import { PostGrid } from "../components/posts/PostGrid";
import { EmptyState } from "../components/ui/Decor";
import { ButtonLink } from "../components/ui/Button";
import { StampBadge } from "../components/ui/StampBadge";

export default function Explore() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const search = params.get("q") ?? "";

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [query, params, setParams]);

  const meta = slug ? categoryMeta(slug) : null;
  const filters = useMemo(() => ({ category: slug, search: search || undefined }), [slug, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <header className="grid gap-8 border-b border-ink/10 pb-8 md:grid-cols-[1fr_340px] md:items-end">
        <div>
          {meta ? (
            <>
              <StampBadge slug={meta.slug} size="md" />
              <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight md:text-6xl">{meta.name}</h1>
              <p className="mt-3 max-w-xl text-ink-soft">{meta.description}</p>
            </>
          ) : (
            <>
              <p className="eyebrow">The Field Journal</p>
              <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-6xl">
                Every entry, <em className="text-terracotta">every</em> drawer.
              </h1>
              <p className="mt-3 max-w-xl text-ink-soft">Newest postcards first. Pick a stamp to narrow it down.</p>
            </>
          )}
        </div>
        <label className="relative block">
          <span className="sr-only">Search entries</span>
          <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and stories…"
            className="w-full border-0 border-b-2 border-ink/25 bg-transparent py-3 pl-7 font-display text-lg focus:border-terracotta focus:outline-none"
          />
        </label>
      </header>

      <div className="mt-6">
        <CategoryRail />
      </div>

      <section className="mt-10">
        <PostGrid
          filters={filters}
          empty={
            <EmptyState
              title={search ? `Nothing matches “${search}”.` : meta ? `No ${meta.name.toLowerCase()} entries yet.` : "The journal is empty."}
              action={
                <ButtonLink to={isAuthenticated ? "/new" : "/register"} size="sm">
                  Write one
                </ButtonLink>
              }
            >
              {search ? "Try a different word, or browse another drawer." : "Every journal starts with a single page."}
            </EmptyState>
          }
        />
      </section>
    </div>
  );
}
