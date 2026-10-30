import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "ink" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.16em] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-paper border border-terracotta-deep shadow-[3px_3px_0_var(--color-ink)] hover:shadow-[1px_1px_0_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px]",
  ink: "bg-ink text-paper border border-ink shadow-[3px_3px_0_var(--color-terracotta)] hover:shadow-[1px_1px_0_var(--color-terracotta)] hover:translate-x-[2px] hover:translate-y-[2px]",
  ghost: "bg-transparent text-ink border border-ink/70 hover:bg-ink hover:text-paper",
  danger: "bg-transparent text-terracotta-deep border border-terracotta-deep hover:bg-terracotta-deep hover:text-paper",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.65rem] px-3 py-1.5",
  md: "text-[0.72rem] px-5 py-2.5",
  lg: "text-xs px-7 py-3.5",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, icon, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", icon, className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
