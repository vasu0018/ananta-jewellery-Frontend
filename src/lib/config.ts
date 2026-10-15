/** API origin; every request goes to `${API_URL}/api/v1`. */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
export const API_BASE = `${API_URL}/api/v1`;

/** Public URL of the storefront, used for canonical links, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3005").replace(/\/$/, "");

export const SITE_NAME = "Ananta Jewellery";

/** Bag limits enforced by the API. */
export const MAX_QTY = 10;
export const MAX_COMPARE = 4;

/** sessionStorage key holding `{orderNumber, email}` of the order just placed (lets guests see their confirmation). */
export const LAST_ORDER_KEY = "aj-last-order";
