import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { API_URL } from "./config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve an API media path (`/uploads/...`) to an absolute URL; absolute URLs pass through. */
export function media(src: string | null | undefined): string | null {
  if (!src) return null;
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** Point uploaded images inside admin-authored HTML at the API origin. */
export function resolveHtmlMedia(html: string) {
  return html.replace(/(<img\b[^>]*?\ssrc=")(\/uploads\/)/gi, `$1${API_URL}$2`);
}

/** Build a query string from a record, skipping empty values. */
export function qs(params: Record<string, string | number | boolean | null | undefined | string[]>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Plain-text excerpt of HTML content for meta descriptions. */
export function stripHtml(html: string | null | undefined, max = 160) {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
