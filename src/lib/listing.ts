/** URL ⇄ API mapping for product listings (shop, category, collection, search, gifting). */

export type SearchParams = Record<string, string | string[] | undefined>;

/** Multi-select facet params, "|"-separated in the URL (facet values such as materials can contain commas). */
export const LIST_KEYS = ["category", "material", "colour", "stone", "occasion", "gender", "size"] as const;
export const LIST_SEP = "|";
/** Single-value params passed straight through. */
export const SCALAR_KEYS = ["q", "minPrice", "maxPrice", "rating", "inStock", "sort", "bestseller", "newArrival", "gift", "flashSale", "featured", "store", "page"] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Bestselling" },
  { value: "newest", label: "New arrivals" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

export const PAGE_SIZE = 24;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function readParams(sp: SearchParams) {
  const lists = Object.fromEntries(
    LIST_KEYS.map((k) => [
      k,
      first(sp[k])
        .split(LIST_SEP)
        .map((s) => s.trim())
        .filter(Boolean),
    ]),
  ) as Record<(typeof LIST_KEYS)[number], string[]>;
  const scalars = Object.fromEntries(SCALAR_KEYS.map((k) => [k, first(sp[k]).trim()])) as Record<(typeof SCALAR_KEYS)[number], string>;
  const page = Math.max(1, Number.parseInt(scalars.page, 10) || 1);
  return { ...lists, ...scalars, page };
}

export type ListingParams = ReturnType<typeof readParams>;

/** API query for `/catalog/products`. `base` holds the page's fixed scope (e.g. its category). */
export function apiQuery(p: ListingParams, base: Record<string, string> = {}) {
  const sp = new URLSearchParams();
  for (const k of LIST_KEYS) if (p[k].length) sp.set(k, p[k].join(LIST_SEP));
  for (const k of SCALAR_KEYS) {
    if (k === "page") continue;
    const v = p[k];
    if (v) sp.set(k, v);
  }
  for (const [k, v] of Object.entries(base)) sp.set(k, v);
  sp.set("page", String(p.page));
  sp.set("limit", String(PAGE_SIZE));
  sp.set("facets", "1");
  return sp.toString();
}

/** Number of shopper-applied filters (drives the "Filters (3)" badge and "Clear all"). */
export function activeFilterCount(p: ListingParams, locked: string[] = []) {
  let n = 0;
  for (const k of LIST_KEYS) if (!locked.includes(k)) n += p[k].length;
  if (p.minPrice || p.maxPrice) n++;
  if (p.rating) n++;
  if (p.inStock) n++;
  return n;
}
