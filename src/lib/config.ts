/**
 * API origin. When the storefront is opened via a LAN IP, rewrite localhost
 * to that host so phones hit this PC's API instead of themselves.
 */
export function resolveApiUrl() {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  if (typeof window === "undefined") return configured;
  const host = window.location.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1") return configured;
  try {
    const u = new URL(configured);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      u.hostname = host;
      return u.origin;
    }
  } catch {
    /* keep configured */
  }
  return configured;
}

/** API origin; every request goes to `${API_URL}/api/v1`. */
export const API_URL = resolveApiUrl();
export const API_BASE = `${API_URL}/api/v1`;

/** Public URL of the storefront, used for canonical links, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005").replace(/\/$/, "");

export const SITE_NAME = "Ananta Jewellery";

/** Bag limits enforced by the API. */
export const MAX_QTY = 10;
export const MAX_COMPARE = 4;

/** sessionStorage key holding `{orderNumber, email}` of the order just placed (lets guests see their confirmation). */
export const LAST_ORDER_KEY = "aj-last-order";
