import type { ReactNode } from "react";
import { formatDate } from "../../lib/format";

interface PassportCardProps {
  username: string;
  fullName: string | null;
  memberSince: string;
  postCount?: number;
  children?: ReactNode;
}

/** Passport identity page used on profile screens. */
export function PassportCard({ username, fullName, memberSince, postCount, children }: PassportCardProps) {
  const name = fullName?.trim() || username;
  const mrz = `P<IHB${username.toUpperCase().replace(/[^A-Z0-9]/g, "<")}<<${name.toUpperCase().replace(/[^A-Z]/g, "<")}`
    .padEnd(44, "<")
    .slice(0, 44);

  return (
    <div className="relative overflow-hidden bg-card shadow-[var(--shadow-lifted)]">
      <div className="flex items-center justify-between bg-ocean px-6 py-3 text-paper">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em]">InsideHub · Passport</span>
        <span className="font-display italic">Vol. 01</span>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[120px_1fr]">
        <div className="flex aspect-[3/4] items-center justify-center border-2 border-ink/80 bg-mustard font-display text-6xl font-semibold text-ink">
          {name.charAt(0).toUpperCase()}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <dt className="eyebrow">Name</dt>
            <dd className="font-display text-3xl font-semibold leading-tight">{name}</dd>
          </div>
          <div>
            <dt className="eyebrow">Handle</dt>
            <dd className="font-mono">@{username}</dd>
          </div>
          <div>
            <dt className="eyebrow">Issued</dt>
            <dd className="font-mono">{formatDate(memberSince)}</dd>
          </div>
          {postCount !== undefined ? (
            <div>
              <dt className="eyebrow">Entries</dt>
              <dd className="font-display text-2xl font-semibold text-terracotta">{postCount}</dd>
            </div>
          ) : null}
          {children ? <div className="col-span-2">{children}</div> : null}
        </dl>
      </div>
      <p className="overflow-hidden whitespace-nowrap border-t border-dashed border-ink/20 px-6 py-3 font-mono text-xs tracking-[0.3em] text-ink-faint">
        {mrz}
      </p>
    </div>
  );
}
