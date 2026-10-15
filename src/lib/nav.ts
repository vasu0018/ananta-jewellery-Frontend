import type { Category, Collection } from "./types";

export type NavLink = { label: string; href: string };
export type NavColumn = { title: string; links: NavLink[] };
export type NavItem = {
  label: string;
  href: string;
  highlight?: boolean;
  columns?: NavColumn[];
  feature?: { title: string; image: string | null; href: string };
};

const COLOURS = ["Gold", "Silver", "Rose Gold", "Oxidised"];
const OCCASIONS = ["Daily Wear", "Office Wear", "Party Wear", "Festive", "Wedding"];
const PRICE_BANDS: { label: string; min?: number; max?: number }[] = [
  { label: "Under ₹999", max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000 – ₹4,999", min: 2000, max: 4999 },
  { label: "₹5,000 & above", min: 5000 },
];

const withQuery = (base: string, params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) sp.set(k, String(v));
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
};

/** Header navigation built from the live category tree and collections. */
export function buildNav(categories: Category[], collections: Collection[]): NavItem[] {
  const byType = (t: Collection["type"]) => collections.filter((c) => c.type === t);
  const toLinks = (list: Collection[]) => list.map((c) => ({ label: c.name, href: `/collections/${c.slug}` }));

  const categoryItems: NavItem[] = categories.map((cat) => {
    const base = `/category/${cat.slug}`;
    const columns: NavColumn[] = [];
    if (cat.children?.length) {
      columns.push({
        title: "Shop by style",
        links: [...cat.children.map((c) => ({ label: c.name, href: `/category/${c.slug}` })), { label: `All ${cat.name}`, href: base }],
      });
    }
    columns.push({ title: "Shop by colour", links: COLOURS.map((c) => ({ label: c, href: withQuery(base, { colour: c }) })) });
    if (cat.slug !== "men") {
      columns.push({ title: "Shop by occasion", links: OCCASIONS.map((o) => ({ label: o, href: withQuery(base, { occasion: o }) })) });
    }
    columns.push({
      title: "Shop by price",
      links: PRICE_BANDS.map((b) => ({ label: b.label, href: withQuery(base, { minPrice: b.min, maxPrice: b.max }) })),
    });
    return { label: cat.name, href: base, columns, feature: { title: `Explore ${cat.name}`, image: cat.image, href: base } };
  });

  const curated = [...byType("CURATED"), ...byType("CELEBRITY")];
  const gifting = byType("GIFTING");
  const bonds = byType("BOND");

  return [
    { label: "New In", href: "/shop?newArrival=1&sort=newest", highlight: true },
    ...categoryItems,
    {
      label: "Collections",
      href: "/collections",
      columns: [
        { title: "Signature edits", links: toLinks(curated) },
        { title: "By colour", links: toLinks(byType("COLOUR")) },
        { title: "By occasion", links: toLinks(byType("OCCASION")) },
      ].filter((c) => c.links.length),
      feature: curated[0] ? { title: curated[0].name, image: curated[0].image, href: `/collections/${curated[0].slug}` } : undefined,
    },
    {
      label: "Gifting",
      href: "/gifting",
      highlight: true,
      columns: [
        { title: "Gifts for", links: toLinks(bonds) },
        { title: "By budget", links: toLinks(gifting) },
        {
          title: "Gift services",
          links: [
            { label: "The gifting edit", href: "/gifting" },
            { label: "Bestselling gifts", href: "/shop?gift=1&sort=popular" },
            { label: "Track an order", href: "/track-order" },
          ],
        },
      ].filter((c) => c.links.length),
      feature: { title: "The Gifting Edit", image: gifting[0]?.image ?? null, href: "/gifting" },
    },
  ];
}

export type TopNavItem = {
  label: string;
  href: string;
  /** Simple dropdown list. */
  links?: NavLink[];
  /** Two-pane dropdown: product types on the left, their shortcuts on the right. */
  types?: NavItem[];
};

/** Desktop text navigation in the GIVA layout (wraps onto two rows on narrower screens). */
export function buildTopNav(categories: Category[], collections: Collection[]): TopNavItem[] {
  const byType = (t: Collection["type"]) => collections.filter((c) => c.type === t);
  const toLinks = (list: Collection[]) => list.map((c) => ({ label: c.name, href: `/collections/${c.slug}` }));
  const types = buildNav(categories, collections).filter((n) => n.href.startsWith("/category/"));
  const items: TopNavItem[] = [
    { label: "Product Type", href: "/shop", types },
    { label: "Shop for Women", href: "/shop?gender=Women" },
    { label: "Shop for Men", href: "/shop?gender=Men" },
    { label: "Gift Store", href: "/gifting", links: [...toLinks(byType("BOND")), ...toLinks(byType("GIFTING"))] },
    { label: "New Arrivals", href: "/shop?newArrival=1&sort=newest" },
    { label: "Bestsellers", href: "/shop?bestseller=1&sort=popular" },
    {
      label: "Shop by Price",
      href: "/shop",
      links: PRICE_BANDS.map((b) => ({ label: b.label, href: withQuery("/shop", { minPrice: b.min, maxPrice: b.max }) })),
    },
    { label: "Shop by Occasion", href: "/collections", links: toLinks(byType("OCCASION")) },
    { label: "Shop by Colour", href: "/collections", links: toLinks(byType("COLOUR")) },
    { label: "View Collections", href: "/collections", links: [...toLinks(byType("CURATED")), ...toLinks(byType("CELEBRITY")), { label: "All collections", href: "/collections" }] },
    { label: "Flash Sale", href: "/shop?flashSale=1" },
    { label: "Our Story", href: "/about" },
    { label: "Journal", href: "/blog" },
  ];
  return items.filter((i) => !(i.links && !i.links.length));
}
