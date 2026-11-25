import { useEffect, useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import {
  useAdminOrganizations,
  useJoinOrganization,
  useMyOrganizations,
  useOrganizationMembers,
} from "../hooks/organizations";
import { Button, ButtonLink } from "../components/ui/Button";
import { EmptyState, Spinner } from "../components/ui/Decor";
import { formatDate } from "../lib/format";
import type { OrganizationAdmin } from "../types";

export default function Organizations() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const mine = useMyOrganizations(Boolean(user));
  const joinOrg = useJoinOrganization();
  const adminOrgs = useAdminOrganizations(Boolean(user?.is_admin));

  const initialSelected =
    (location.state as { selectedOrgId?: string } | null)?.selectedOrgId ?? null;
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(initialSelected);
  const members = useOrganizationMembers(selectedOrgId, Boolean(user?.is_admin));

  useEffect(() => {
    if (!user?.is_admin || !adminOrgs.data?.length) return;
    if (selectedOrgId && adminOrgs.data.some((o) => o.id === selectedOrgId)) return;
    setSelectedOrgId(adminOrgs.data[0].id);
  }, [user?.is_admin, adminOrgs.data, selectedOrgId]);

  if (authLoading) return <Spinner label="Checking your passport…" />;
  if (!user) return <Navigate to="/login?next=/organizations" replace />;

  const myOrg = mine.data?.[0] ?? null;
  const selectedOrg: OrganizationAdmin | null =
    adminOrgs.data?.find((o) => o.id === selectedOrgId) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Organizations</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {user.is_admin ? "Workspace directory" : "Your organization"}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            {user.is_admin
              ? "Browse every organization and its members. Use Create organization when you need a new workspace."
              : "You belong to a single organization. Your posts and journal live inside that workspace."}
          </p>
        </div>
        {user.is_admin ? (
          <ButtonLink to="/organizations/new" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Create organization
          </ButtonLink>
        ) : null}
      </div>

      {user.is_admin ? (
        <section className="mt-10 bg-card p-6 shadow-[var(--shadow-postcard)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Directory</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">All organizations</h2>
            </div>
            {adminOrgs.data ? (
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft">
                {adminOrgs.data.length} workspace{adminOrgs.data.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>

          {adminOrgs.isPending ? (
            <div className="mt-8">
              <Spinner />
            </div>
          ) : adminOrgs.isError ? (
            <p className="mt-6 text-sm text-terracotta-deep">{errorMessage(adminOrgs.error)}</p>
          ) : !adminOrgs.data?.length ? (
            <div className="mt-6">
              <EmptyState
                title="No organizations yet."
                action={
                  <ButtonLink to="/organizations/new" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    Create organization
                  </ButtonLink>
                }
              >
                Open the first workspace from the button above.
              </EmptyState>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
              <ul className="space-y-2 border-b border-ink/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                {adminOrgs.data.map((org) => {
                  const active = org.id === selectedOrgId;
                  return (
                    <li key={org.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrgId(org.id)}
                        className={`w-full border px-4 py-3 text-left transition ${
                          active
                            ? "border-ink bg-paper-deep shadow-[2px_2px_0_var(--color-ink)]"
                            : "border-ink/15 bg-transparent hover:border-ink/40"
                        }`}
                      >
                        <p className="font-display text-lg font-semibold leading-tight">{org.name}</p>
                        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft">
                          {org.slug} · {org.member_count} member{org.member_count === 1 ? "" : "s"}
                          {org.email_domain ? ` · @${org.email_domain}` : ""}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div>
                {selectedOrg ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-ocean" />
                          <span className="eyebrow">Members</span>
                        </div>
                        <h3 className="mt-1 font-display text-2xl font-semibold">{selectedOrg.name}</h3>
                        <p className="mt-1 font-mono text-xs text-ink-soft">
                          {selectedOrg.slug} · since {formatDate(selectedOrg.created_at)}
                          {selectedOrg.email_domain ? ` · @${selectedOrg.email_domain}` : ""}
                        </p>
                      </div>
                    </div>

                    {members.isPending ? (
                      <div className="mt-8">
                        <Spinner />
                      </div>
                    ) : members.isError ? (
                      <p className="mt-6 text-sm text-terracotta-deep">{errorMessage(members.error)}</p>
                    ) : !members.data?.length ? (
                      <p className="mt-6 text-sm text-ink-soft">No members in this organization.</p>
                    ) : (
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                          <thead>
                            <tr className="border-b border-ink/15 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
                              <th className="pb-2 pr-4 font-normal">Name</th>
                              <th className="pb-2 pr-4 font-normal">Email</th>
                              <th className="pb-2 pr-4 font-normal">Role</th>
                              <th className="pb-2 font-normal">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.data.map((member) => (
                              <tr key={member.id} className="border-b border-ink/10">
                                <td className="py-3 pr-4 align-top">
                                  <p className="font-semibold text-ink">
                                    {member.full_name?.trim() || member.username}
                                  </p>
                                  <p className="font-mono text-xs text-ink-soft">@{member.username}</p>
                                </td>
                                <td className="py-3 pr-4 align-top font-mono text-xs break-all">
                                  {member.email}
                                </td>
                                <td className="py-3 pr-4 align-top font-mono text-xs uppercase tracking-wider">
                                  {member.org_role ?? "—"}
                                </td>
                                <td className="py-3 align-top">
                                  <span
                                    className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] ${
                                      member.is_active ? "text-sage" : "text-terracotta-deep"
                                    }`}
                                  >
                                    {member.is_active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-ink-soft">Select an organization to see its members.</p>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}

      <div className="mt-10">
        <section className="bg-card p-6 shadow-[var(--shadow-postcard)] lg:max-w-xl">
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
                You monitor the platform. You are not a member of a workspace — browse organizations above or open
                Explore to review posts across every organization.
              </p>
              <ButtonLink to="/explore" size="sm" variant="ghost">
                Open Explore
              </ButtonLink>
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
              {myOrg.email_domain ? (
                <div>
                  <span className="eyebrow">Email domain</span>
                  <p className="font-mono text-sm">@{myOrg.email_domain}</p>
                </div>
              ) : null}
              <div>
                <span className="eyebrow">Joined</span>
                <p className="text-sm">{formatDate(myOrg.created_at)}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <EmptyState title="No organization yet.">
                If your company workspace already exists, join with the same domain as your email.
              </EmptyState>
              {joinOrg.isError ? (
                <p className="text-sm text-terracotta-deep">{errorMessage(joinOrg.error)}</p>
              ) : null}
              <Button
                type="button"
                size="sm"
                loading={joinOrg.isPending}
                onClick={() => joinOrg.mutate()}
              >
                Join with my email domain
              </Button>
            </div>
          )}

          {!user.is_admin ? (
            <Link to="/me" className="mt-6 inline-block eyebrow text-terracotta underline-offset-4 hover:underline">
              Back to your journal →
            </Link>
          ) : null}
        </section>
      </div>
    </div>
  );
}
