import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePostsFeed } from "../hooks/posts";
import { CATEGORIES } from "../lib/categories";
import { ButtonLink } from "../components/ui/Button";
import { RouteLine, SectionHeading } from "../components/ui/Decor";
import { PostGrid } from "../components/posts/PostGrid";

const placeholderFrames = [
  { label: "Kyoto, at dawn", color: "var(--color-ocean)", rotate: -7 },
  { label: "Market noodles", color: "var(--color-mustard)", rotate: 4 },
  { label: "Above the clouds", color: "var(--color-sage)", rotate: -2 },
];

function HeroCollage() {
  const feed = usePostsFeed({}, 12);
  const withPhotos = (feed.data?.pages.flat() ?? []).filter((p) => p.images.length > 0).slice(0, 3);

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-md md:h-[480px]">
      {placeholderFrames.map((frame, i) => {
        const post = withPhotos[i];
        const positions = ["left-0 top-6", "right-0 top-0", "left-14 bottom-0"];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: frame.rotate }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 90, damping: 14 }}
            className={`absolute w-56 md:w-64 ${positions[i]}`}
          >
            <Link to={post ? `/p/${post.id}` : "/explore"} className="postcard block !pb-3">
              {post ? (
                <img src={post.images[0].image_url} alt="" className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div
                  className="aspect-[4/5] w-full"
                  style={{
                    background: `linear-gradient(160deg, ${frame.color}, color-mix(in oklab, ${frame.color} 55%, #1f1b16))`,
                  }}
                />
              )}
              <span className="mt-2 block text-center font-hand text-xl text-ink-soft">{post ? post.title : frame.label}</span>
            </Link>
          </motion.div>
        );
      })}
      <span
        className="stamp absolute -right-2 bottom-16 rotate-12"
        style={{ "--stamp-color": "var(--color-terracotta)" } as CSSProperties}
      >
        Par avion
      </span>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <p className="eyebrow">Issue no. 01 — The inside of everywhere</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Stories worth <em className="text-terracotta">unpacking</em>, from people who were there.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            InsideHub is a shared field journal. Post travel stories, photo essays and blogs, file them in a drawer,
            and read what everyone else brought home.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink to="/explore" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Open the journal
            </ButtonLink>
            <ButtonLink
              to={isAuthenticated ? "/new" : "/register"}
              size="lg"
              variant="ghost"
              icon={<PenLine className="h-4 w-4" />}
            >
              {isAuthenticated ? "Write an entry" : "Start writing"}
            </ButtonLink>
          </div>
          <p className="mt-10 font-hand text-2xl text-ocean">— no algorithms, just postcards.</p>
        </div>
        <HeroCollage />
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <RouteLine />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Choose a drawer" title={<>Every story gets its own stamp.</>}>
          Browse by what you are in the mood for — a slow read about a mountain village, or a quick bowl of street food.
        </SectionHeading>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 4) * 0.06 }}
              >
                <Link
                  to={`/c/${c.slug}`}
                  className="group relative block h-full bg-card p-5 shadow-[var(--shadow-postcard)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lifted)]"
                  style={{ transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)` }}
                >
                  <div
                    className="stamp !flex aspect-square w-16 justify-center !p-0"
                    style={{ "--stamp-color": c.color } as CSSProperties}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold group-hover:text-terracotta">{c.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.description}</p>
                  <span className="absolute right-4 top-4 font-mono text-[0.6rem] tracking-[0.3em] text-ink-faint">{c.code}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Fresh from the post" title="Latest entries" />
          <Link to="/explore" className="eyebrow inline-flex items-center gap-2 hover:text-terracotta">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PostGrid
          filters={{}}
          pageSize={6}
          paginate={false}
          empty={
            <div className="mx-auto max-w-lg border-2 border-dashed border-ink/20 bg-card/60 px-8 py-14 text-center">
              <p className="font-hand text-3xl text-terracotta">the first page is blank…</p>
              <p className="mt-2 font-display text-2xl font-semibold">Be the first to write in the journal.</p>
              <div className="mt-6 flex justify-center">
                <ButtonLink to={isAuthenticated ? "/new" : "/register"}>Write the first entry</ButtonLink>
              </div>
            </div>
          }
        />
      </section>
    </>
  );
}
