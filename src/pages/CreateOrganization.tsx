import { useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { useCreateOrganization } from "../hooks/organizations";
import { Button } from "../components/ui/Button";
import { Input, PasswordInput, FormError } from "../components/ui/Field";
import { Spinner } from "../components/ui/Decor";

export default function CreateOrganization() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createOrg = useCreateOrganization();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    email_domain: "",
    description: "",
    industry: "",
    target_audience: "",
    website_url: "",
    brand_keywords: "",
    owner_email: "",
    owner_username: "",
    owner_password: "",
    owner_full_name: "",
  });
  const [created, setCreated] = useState<{
    id: string;
    name: string;
    owner_email: string | null;
    email_domain: string | null;
  } | null>(null);

  if (authLoading) return <Spinner label="Checking your passport…" />;
  if (!user) return <Navigate to="/login?next=/organizations/new" replace />;
  if (!user.is_admin) return <Navigate to="/organizations" replace />;

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      const org = await createOrg.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        email_domain: form.email_domain.trim() || undefined,
        description: form.description.trim() || undefined,
        industry: form.industry.trim() || undefined,
        target_audience: form.target_audience.trim() || undefined,
        website_url: form.website_url.trim() || undefined,
        brand_keywords: form.brand_keywords.trim() || undefined,
        owner_email: form.owner_email.trim(),
        owner_username: form.owner_username.trim(),
        owner_password: form.owner_password,
        owner_full_name: form.owner_full_name.trim() || undefined,
      });
      setCreated({
        id: org.id,
        name: org.name,
        owner_email: org.owner_email,
        email_domain: org.email_domain,
      });
    } catch {
      // surfaced via createOrg.error
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-10 pb-16 sm:px-6">
      <Link to="/organizations" className="eyebrow inline-flex items-center gap-2 hover:text-terracotta">
        <ArrowLeft className="h-3 w-3" /> Back to directory
      </Link>

      <p className="mt-6 eyebrow">Admin desk</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Create organization</h1>
      <p className="mt-3 text-ink-soft">
        Open a workspace, set the company email domain, and create the first owner. Anyone who
        later registers with that domain joins as a member automatically.
      </p>

      {created ? (
        <div className="mt-10 space-y-6 bg-card p-6 shadow-[var(--shadow-postcard)]">
          <div className="flex items-start gap-3 border border-sage/40 bg-paper-deep/40 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
            <div className="text-sm">
              <p className="font-semibold text-ink">{created.name} is ready.</p>
              <p className="mt-1 text-ink-soft">
                Owner login: <span className="font-mono text-ink">{created.owner_email}</span>
              </p>
              {created.email_domain ? (
                <p className="mt-1 text-ink-soft">
                  Members can join with{" "}
                  <span className="font-mono text-ink">@{created.email_domain}</span> emails.
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => navigate("/organizations", { state: { selectedOrgId: created.id } })}
            >
              View in directory
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCreated(null)}>
              Create another
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onCreate} className="mt-10 space-y-5 bg-card p-6 shadow-[var(--shadow-postcard)]">
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
          <Input
            label="Email domain"
            name="email_domain"
            required
            placeholder="acme.com"
            hint="Employees registering with this domain join automatically. No @ prefix."
            value={form.email_domain}
            onChange={(e) => setForm((f) => ({ ...f, email_domain: e.target.value }))}
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Industry"
            name="industry"
            value={form.industry}
            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
          />
          <Input
            label="Target audience"
            name="target_audience"
            value={form.target_audience}
            onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
          />
          <Input
            label="Website URL"
            name="website_url"
            type="url"
            value={form.website_url}
            onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
          />
          <Input
            label="Brand keywords"
            name="brand_keywords"
            hint="Comma-separated phrases the writing assistant should prefer."
            value={form.brand_keywords}
            onChange={(e) => setForm((f) => ({ ...f, brand_keywords: e.target.value }))}
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
      )}
    </div>
  );
}
