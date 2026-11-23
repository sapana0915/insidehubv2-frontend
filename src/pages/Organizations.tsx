import { useState, type FormEvent } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { useCreateOrganization, useMyOrganizations } from "../hooks/organizations";
import { Button } from "../components/ui/Button";
import { Input, PasswordInput, FormError } from "../components/ui/Field";
import { EmptyState, Spinner } from "../components/ui/Decor";
import { formatDate } from "../lib/format";

export default function Organizations() {
  const { user, isLoading: authLoading } = useAuth();
  const mine = useMyOrganizations(Boolean(user));
  const createOrg = useCreateOrganization();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    owner_email: "",
    owner_username: "",
    owner_password: "",
    owner_full_name: "",
  });
  const [created, setCreated] = useState<{ name: string; owner_email: string | null } | null>(null);

  if (authLoading) return <Spinner label="Checking your passport…" />;
  if (!user) return <Navigate to="/login?next=/organizations" replace />;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreated(null);
    try {
      const org = await createOrg.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        owner_email: form.owner_email.trim(),
        owner_username: form.owner_username.trim(),
        owner_password: form.owner_password,
        owner_full_name: form.owner_full_name.trim() || undefined,
      });
      setCreated({ name: org.name, owner_email: org.owner_email });
      setForm({
        name: "",
        slug: "",
        owner_email: "",
        owner_username: "",
        owner_password: "",
        owner_full_name: "",
      });
    } catch {
      // surfaced via createOrg.error
    }
  }

  const myOrg = mine.data?.[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-16 sm:px-6">
      <p className="eyebrow">Organizations</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        {user.is_admin ? "Provision a workspace" : "Your organization"}
      </h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        {user.is_admin
          ? "Create an organization and its first owner. Employees belong to one organization each, with their own email."
          : "You belong to a single organization. Your posts and journal live inside that workspace."}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <section className="bg-card p-6 shadow-[var(--shadow-postcard)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-mustard">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="eyebrow">Membership</p>
              <h2 className="font-display text-2xl font-semibold">Where you stand</h2>
            </div>
          </div>

          {mine.isPending ? (
            <div className="mt-8">
              <Spinner />
            </div>
          ) : mine.isError ? (
            <p className="mt-6 text-sm text-terracotta-deep">{errorMessage(mine.error)}</p>
          ) : user.is_admin && !myOrg ? (
            <div className="mt-6 space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-ocean">Platform admin</p>
              <p className="text-sm text-ink-soft">
                You run the platform. You are not a member of any organization — create one below and assign an
                owner.
              </p>
            </div>
          ) : myOrg ? (
            <div className="mt-6 space-y-4">
              <div>
                <span className="eyebrow">Name</span>
                <p className="font-display text-2xl font-semibold">{myOrg.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="eyebrow">Slug</span>
                  <p className="font-mono text-sm">{myOrg.slug}</p>
                </div>
                <div>
                  <span className="eyebrow">Your role</span>
                  <p className="font-mono text-sm uppercase tracking-wider">{myOrg.role ?? "—"}</p>
                </div>
              </div>
              <div>
                <span className="eyebrow">Joined</span>
                <p className="text-sm">{formatDate(myOrg.created_at)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState title="No organization yet.">
                Ask your platform admin to create a workspace and make you the owner, or wait for an invite to
                your company email.
              </EmptyState>
            </div>
          )}
        </section>

        {user.is_admin ? (
          <section className="bg-card p-6 shadow-[var(--shadow-postcard)]">
            <p className="eyebrow">Admin desk</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Create organization</h2>
            <p className="mt-2 text-sm text-ink-soft">
              One request creates the organization and a new owner account for that workspace.
            </p>

            {created ? (
              <div className="mt-6 flex items-start gap-3 border border-sage/40 bg-paper-deep/40 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
                <div className="text-sm">
                  <p className="font-semibold text-ink">
                    {created.name} is ready.
                  </p>
                  <p className="mt-1 text-ink-soft">
                    Owner login: <span className="font-mono text-ink">{created.owner_email}</span>
                  </p>
                </div>
              </div>
            ) : null}

            <form onSubmit={onCreate} className="mt-6 space-y-5">
              <FormError message={createOrg.isError ? errorMessage(createOrg.error) : null} />
              <Input
                label="Organization name"
                name="name"
                required
                minLength={3}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Slug"
                name="slug"
                hint="Optional. Letters, numbers, hyphens. Auto-built from the name if empty."
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
              <div className="border-t border-ink/10 pt-5">
                <p className="eyebrow">First owner</p>
              </div>
              <Input
                label="Owner email"
                name="owner_email"
                type="email"
                required
                value={form.owner_email}
                onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))}
              />
              <Input
                label="Owner username"
                name="owner_username"
                required
                minLength={3}
                value={form.owner_username}
                onChange={(e) => setForm((f) => ({ ...f, owner_username: e.target.value }))}
              />
              <Input
                label="Owner full name"
                name="owner_full_name"
                value={form.owner_full_name}
                onChange={(e) => setForm((f) => ({ ...f, owner_full_name: e.target.value }))}
              />
              <PasswordInput
                label="Owner password"
                name="owner_password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.owner_password}
                onChange={(e) => setForm((f) => ({ ...f, owner_password: e.target.value }))}
              />
              <Button type="submit" size="lg" loading={createOrg.isPending} className="w-full">
                Create organization
              </Button>
            </form>
          </section>
        ) : (
          <section className="bg-card p-6 shadow-[var(--shadow-postcard)]">
            <p className="eyebrow">Need a change?</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Talk to your admin</h2>
            <p className="mt-3 text-sm text-ink-soft">
              Only the platform admin can open a new organization. Your org owner can add more employees later.
            </p>
            <Link to="/me" className="mt-6 inline-block eyebrow text-terracotta underline-offset-4 hover:underline">
              Back to your journal →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
