/** Only same-site paths are allowed as post-login destinations (no `//evil.com` or absolute URLs). */
export function safeNext(next: string | string[] | null | undefined, fallback = "/account") {
  const v = Array.isArray(next) ? next[0] : next;
  return v && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}
