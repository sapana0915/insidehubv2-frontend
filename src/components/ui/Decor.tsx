import type { ReactNode } from "react";
import { Plane } from "lucide-react";

export function TornDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`block h-6 w-full text-paper-deep ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M0 24 L0 10 L28 14 L55 6 L90 12 L120 4 L160 13 L190 7 L230 15 L260 5 L300 11 L335 3 L370 12 L410 6 L445 14 L480 8 L520 15 L555 5 L590 12 L630 4 L665 13 L700 7 L740 14 L775 6 L810 12 L850 3 L885 11 L920 6 L960 15 L995 7 L1030 13 L1070 4 L1105 12 L1140 6 L1170 13 L1200 8 L1200 24 Z"
      />
    </svg>
  );
}

export function RouteLine({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center ${className}`} aria-hidden>
      <span className="h-2 w-2 rounded-full border-2 border-ink-faint" />
      <span className="route-line h-px flex-1" />
      <Plane className="mx-2 h-4 w-4 rotate-45 text-terracotta" />
      <span className="route-line h-px flex-1" />
      <span className="h-2 w-2 rounded-full bg-ink-faint" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl">{title}</h2>
      {children ? <p className="mt-4 text-ink-soft">{children}</p> : null}
    </div>
  );
}

export function Spinner({ label = "Developing film…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-dashed border-terracotta" />
      <span className="eyebrow">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg border-2 border-dashed border-ink/20 bg-card/60 px-8 py-14 text-center">
      <p className="font-hand text-3xl text-terracotta">nothing here yet…</p>
      <h3 className="mt-2 font-display text-2xl font-semibold">{title}</h3>
      {children ? <p className="mt-3 text-sm text-ink-soft">{children}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
