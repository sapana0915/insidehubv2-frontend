import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { categoryMeta } from "../../lib/categories";

interface StampBadgeProps {
  slug: string;
  link?: boolean;
  tilt?: number;
  size?: "sm" | "md";
  className?: string;
}

export function StampBadge({ slug, link = false, tilt = -3, size = "sm", className = "" }: StampBadgeProps) {
  const meta = categoryMeta(slug);
  const Icon = meta.icon;
  const style = { "--stamp-color": meta.color, transform: `rotate(${tilt}deg)` } as CSSProperties;
  const content = (
    <>
      <Icon className={size === "md" ? "h-4 w-4" : "h-3 w-3"} strokeWidth={2} />
      <span>{meta.name}</span>
    </>
  );
  const cls = `stamp ${size === "md" ? "text-[0.75rem] px-4 py-2" : ""} ${className}`;

  if (link) {
    return (
      <Link to={`/c/${meta.slug}`} className={`${cls} hover:brightness-110`} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <span className={cls} style={style}>
      {content}
    </span>
  );
}
