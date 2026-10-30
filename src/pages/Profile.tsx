import { useState, type FormEvent } from "react";
import { PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile, useUpdateMe } from "../hooks/users";
import { errorMessage } from "../api/client";
import { PassportCard } from "../components/layout/PassportCard";
import { PostGrid } from "../components/posts/PostGrid";
import { EmptyState, Spinner } from "../components/ui/Decor";
import { Button, ButtonLink } from "../components/ui/Button";
import { Input, FormError } from "../components/ui/Field";

export default function Profile() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const updateMe = useUpdateMe();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "" });

  if (!user) return <Spinner />;

  function startEditing() {
    setForm({ full_name: user!.full_name ?? "", username: user!.username });
    updateMe.reset();
    setEditing(true);
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    try {
      await updateMe.mutateAsync({
        full_name: form.full_name.trim() || undefined,
        username: form.username.trim() || undefined,
      });
      setEditing(false);
    } catch {
      // surfaced through updateMe.error
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-start">
        <div className="space-y-5">
          <PassportCard
            username={user.username}
            fullName={user.full_name}
            memberSince={user.created_at}
            postCount={profile.data?.post_count}
          >
            <span className="eyebrow">Email</span>
            <p className="font-mono text-sm">{user.email}</p>
          </PassportCard>

          {editing ? (
            <form onSubmit={onSave} className="space-y-5 bg-card p-6 shadow-[var(--shadow-postcard)]">
              <FormError message={updateMe.isError ? errorMessage(updateMe.error) : null} />
              <Input label="Full name" name="full_name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
              <Input label="Username" name="username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
              <div className="flex gap-3">
                <Button type="submit" size="sm" loading={updateMe.isPending}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={startEditing}>
                Edit passport
              </Button>
              <ButtonLink to="/new" size="sm" icon={<PenLine className="h-3.5 w-3.5" />}>
                New entry
              </ButtonLink>
            </div>
          )}
        </div>

        <section>
          <p className="eyebrow">Your journal</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Entries you've posted</h1>
          <div className="mt-8">
            <PostGrid
              filters={{ author_id: user.id }}
              empty={
                <EmptyState title="Your journal is waiting." action={<ButtonLink to="/new">Write your first entry</ButtonLink>}>
                  Share a trip, a photo set or a thought — it'll appear here and in the public feed.
                </EmptyState>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
