import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/users";
import { PassportCard } from "../components/layout/PassportCard";
import { PostGrid } from "../components/posts/PostGrid";
import { EmptyState, Spinner } from "../components/ui/Decor";
import { ButtonLink } from "../components/ui/Button";

export default function Author() {
  const { id } = useParams();
  const { user } = useAuth();
  const profile = useProfile(id);

  if (user && id === user.id) return <Navigate to="/me" replace />;
  if (profile.isPending) return <Spinner />;
  if (profile.isError || !profile.data) {
    return (
      <div className="px-4 py-20">
        <EmptyState title="We couldn't find that traveller." action={<ButtonLink to="/explore">Back to the journal</ButtonLink>} />
      </div>
    );
  }

  const p = profile.data;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-start">
        <PassportCard username={p.username} fullName={p.full_name} memberSince={p.created_at} postCount={p.post_count} />
        <section>
          <p className="eyebrow">Field notes by</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">{p.full_name || p.username}</h1>
          <div className="mt-8">
            <PostGrid filters={{ author_id: p.id }} empty={<EmptyState title="No entries yet." />} />
          </div>
        </section>
      </div>
    </div>
  );
}
