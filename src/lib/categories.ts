import {
  Camera,
  Coffee,
  Compass,
  Cpu,
  Landmark,
  Mountain,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "../types";

export interface CategoryMeta extends Category {
  icon: LucideIcon;
  color: string;
  code: string;
}

/** Mirrors the backend list in app/posts/constants.py; the backend stays the source of truth for slugs. */
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "travel-stories",
    name: "Travel Stories",
    description: "Journeys, detours and the people met along the way.",
    icon: Compass,
    color: "var(--color-terracotta)",
    code: "TRV",
  },
  {
    slug: "photography",
    name: "Photography",
    description: "Frames worth a thousand words.",
    icon: Camera,
    color: "var(--color-ocean)",
    code: "PHO",
  },
  {
    slug: "food",
    name: "Food",
    description: "Street stalls, kitchens and recipes from everywhere.",
    icon: UtensilsCrossed,
    color: "var(--color-mustard)",
    code: "FOD",
  },
  {
    slug: "culture",
    name: "Culture",
    description: "Traditions, festivals, art and history.",
    icon: Landmark,
    color: "var(--color-plum)",
    code: "CUL",
  },
  {
    slug: "adventure",
    name: "Adventure",
    description: "Peaks, trails, waves and everything outdoors.",
    icon: Mountain,
    color: "var(--color-sage)",
    code: "ADV",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    description: "Everyday rituals, homes and slow living.",
    icon: Coffee,
    color: "var(--color-terracotta-deep)",
    code: "LIF",
  },
  {
    slug: "tech",
    name: "Tech",
    description: "Gear, tools and notes from the digital road.",
    icon: Cpu,
    color: "var(--color-ink-soft)",
    code: "TEC",
  },
  {
    slug: "other",
    name: "Other",
    description: "Everything that doesn't fit a box.",
    icon: Sparkles,
    color: "var(--color-ink)",
    code: "OTH",
  },
];

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function categoryMeta(slug: string): CategoryMeta {
  return (
    BY_SLUG.get(slug) ?? {
      slug,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      description: "",
      icon: Sparkles,
      color: "var(--color-ink)",
      code: slug.slice(0, 3).toUpperCase(),
    }
  );
}
