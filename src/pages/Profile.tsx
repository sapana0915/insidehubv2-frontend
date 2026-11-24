import { useState, type FormEvent } from "react";
import { Building2, PenLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile, useUpdateMe } from "../hooks/users";
import { useJoinOrganization, useMyOrganizations } from "../hooks/organizations";
import { errorMessage } from "../api/client";
import { PassportCard } from "../components/layout/PassportCard";
import { JournalExport } from "../components/profile/JournalExport";
import { PostGrid } from "../components/posts/PostGrid";
import { EmptyState, Spinner } from "../components/ui/Decor";
import { Button, ButtonLink } from "../components/ui/Button";
import { Input, FormError } from "../components/ui/Field";

export default function Profile() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const myOrgs = useMyOrganizations(Boolean(user));
  const joinOrg = useJoinOrganization();
  const updateMe = useUpdateMe();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "" });

  if (!user) return <Spinner />;

  const myOrg = myOrgs.data?.[0] ?? null;

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
            <p className="break-all font-mono text-sm">{user.email}</p>
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
              {!user.is_admin ? (
                <ButtonLink to="/new" size="sm" icon={<PenLine className="h-3.5 w-3.5" />}>
                  New entry
                </ButtonLink>
              ) : (
                <ButtonLink to="/explore" size="sm">
                  Review posts
                </ButtonLink>
              )}
            </div>
          )}

          <div className="bg-card p-5 shadow-[var(--shadow-postcard)]">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-ocean" />
              <span className="eyebrow">Organization</span>
            </div>
            {myOrgs.isPending ? (
              <p className="mt-3 text-sm text-ink-faint">Loading…</p>
            ) : myOrg ? (
              <div className="mt-3">
                <p className="font-display text-xl font-semibold">{myOrg.name}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-soft">
                  {myOrg.role ?? "member"}
                </p>
                <ButtonLink to="/organizations" size="sm" variant="ghost" className="mt-4">
                  View organization
                </ButtonLink>
              </div>
            ) : user.is_admin ? (
              <div className="mt-3">
                <p className="text-sm text-ink-soft">You manage the platform.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLink to="/organizations" size="sm">
                    Workspace directory
                  </ButtonLink>
                  <ButtonLink to="/organizations/new" size="sm" variant="ghost">
                    Create organization
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-ink-soft">
                  Not assigned yet. If your admin set up a workspace for your email domain, you can join
                  now.
                </p>
                {joinOrg.isError ? (
                  <p className="text-sm text-terracotta-deep">{errorMessage(joinOrg.error)}</p>
                ) : null}
                <Button type="button" size="sm" loading={joinOrg.isPending} onClick={() => joinOrg.mutate()}>
                  Join with my email domain
                </Button>
              </div>
            )}
          </div>

          <JournalExport username={user.username} postCount={profile.data?.post_count} />
        </div>

        <section>
          <p className="eyebrow">{user.is_admin ? "Monitoring" : "Your journal"}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {user.is_admin ? "Review the field journal" : "Entries you've posted"}
          </h1>
          <div className="mt-8">
            {user.is_admin ? (
              <EmptyState
                title="Open Explore to review posts."
                action={<ButtonLink to="/explore">Go to Explore</ButtonLink>}
              >
                Platform admins monitor every organization&apos;s entries. Click a postcard to open it.
              </EmptyState>
            ) : (
              <PostGrid
                filters={{ author_id: user.id }}
                empty={
                  <EmptyState title="Your journal is waiting." action={<ButtonLink to="/new">Write your first entry</ButtonLink>}>
                    Share a trip, a photo set or a thought — it'll appear here and in the public feed.
                  </EmptyState>
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
