export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("en-GB", opts);
}

export function postmarkDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    year: String(d.getFullYear()),
  };
}

export function excerpt(text: string, length = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trimEnd()}…` : clean;
}

export function readingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function displayName(user: { username: string; full_name: string | null } | null | undefined) {
  if (!user) return "A traveller";
  return user.full_name?.trim() || user.username;
}

export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function tiltFor(index: number) {
  const tilts = [-1.2, 0.8, -0.5, 1.1, -0.9, 0.4];
  return tilts[index % tilts.length];
}
