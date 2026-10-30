import type { ReactNode } from "react";
import { Plane } from "lucide-react";

interface BoardingPassProps {
  from: string;
  to: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Ticket-shaped card used to frame the auth forms. */
export function BoardingPass({ from, to, title, subtitle, children, footer }: BoardingPassProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="grid overflow-hidden bg-card shadow-[var(--shadow-lifted)] md:grid-cols-[1fr_260px]">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between border-b-2 border-dashed border-ink/15 pb-5">
            <div>
              <p className="eyebrow">From</p>
              <p className="font-display text-3xl font-semibold">{from}</p>
            </div>
            <Plane className="h-6 w-6 text-terracotta" />
            <div className="text-right">
              <p className="eyebrow">To</p>
              <p className="font-display text-3xl font-semibold">{to}</p>
            </div>
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-ink-soft">{footer}</div> : null}
        </div>

        <aside className="relative hidden flex-col justify-between border-l-2 border-dashed border-ink/20 bg-ink p-8 text-paper md:flex">
          <span className="absolute -left-[14px] -top-[14px] h-7 w-7 rounded-full bg-paper" />
          <span className="absolute -bottom-[14px] -left-[14px] h-7 w-7 rounded-full bg-paper" />
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-paper/60">Boarding pass</p>
            <p className="mt-2 font-display text-2xl font-semibold italic">
              Inside<span className="text-terracotta">Hub</span>
            </p>
          </div>
          <dl className="space-y-4 font-mono text-xs uppercase tracking-[0.2em]">
            <div>
              <dt className="text-paper/50">Gate</dt>
              <dd className="text-lg">B-07</dd>
            </div>
            <div>
              <dt className="text-paper/50">Seat</dt>
              <dd className="text-lg">Window</dd>
            </div>
            <div>
              <dt className="text-paper/50">Class</dt>
              <dd className="text-lg">Storyteller</dd>
            </div>
          </dl>
          <div
            className="h-14 w-full"
            aria-hidden
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--color-paper) 0 2px, transparent 2px 4px, var(--color-paper) 4px 5px, transparent 5px 8px, var(--color-paper) 8px 11px, transparent 11px 13px)",
            }}
          />
        </aside>
      </div>
    </div>
  );
}
