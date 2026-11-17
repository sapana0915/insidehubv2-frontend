import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "a",
];

const ALLOWED_ATTR = ["href", "title", "target", "rel"];

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Strip tags for excerpts, reading time, and empty checks. */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyHtml(html: string): boolean {
  return stripHtml(html).length === 0;
}

/** Turn AI / legacy plain text into TipTap-friendly paragraph HTML. */
export function plainTextToHtml(text: string): string {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((p) => `<p>${escapeText(p).replace(/\n/g, "<br>")}</p>`).join("");
}

/** Old posts are plain text; new ones are HTML. */
export function ensureHtml(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (/^\s*</.test(trimmed)) return trimmed;
  return plainTextToHtml(trimmed);
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
