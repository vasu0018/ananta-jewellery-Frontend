import type { MetadataRoute } from "next";
import { POLICIES } from "@/content/policies";
import { SITE_URL } from "@/lib/config";
import { getJsonSafe } from "@/lib/server-api";
import { media } from "@/lib/utils";
import type { BlogPostCard, Category, Collection, Paged, ProductCard } from "@/lib/types";

export const revalidate = 3600;

const PAGE_SIZE = 200;
const EMPTY = { items: [], meta: { total: 0, page: 1, limit: PAGE_SIZE, pages: 1 } };

/** Every page of a paginated endpoint (catalogue sizes here are in the low thousands). */
async function all<T>(path: string): Promise<T[]> {
  const first = await getJsonSafe<Paged<T>>(`${path}${path.includes("?") ? "&" : "?"}page=1&limit=${PAGE_SIZE}`, EMPTY, { revalidate });
  const rest = await Promise.all(
    Array.from({ length: Math.min(first.meta.pages, 50) - 1 }, (_, i) =>
      getJsonSafe<Paged<T>>(`${path}${path.includes("?") ? "&" : "?"}page=${i + 2}&limit=${PAGE_SIZE}`, EMPTY, { revalidate }),
    ),
  );
  return [first, ...rest].flatMap((p) => p.items);
}

function flatten(categories: Category[]): Category[] {
  return categories.flatMap((c) => [c, ...flatten(c.children ?? [])]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, collections, products, posts] = await Promise.all([
    getJsonSafe<Category[]>("/catalog/categories", [], { revalidate }),
    getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate }),
    all<ProductCard>("/catalog/products"),
    all<BlogPostCard>("/content/blog"),
  ]);

  const url = (path: string) => `${SITE_URL}${path}`;
  const statics: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/shop"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/collections"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/gifting"), changeFrequency: "weekly", priority: 0.7 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.4 },
    { url: url("/track-order"), changeFrequency: "yearly", priority: 0.3 },
    ...POLICIES.map((p) => ({ url: url(`/policies/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];

  return [
    ...statics,
    ...flatten(categories).map((c) => ({ url: url(`/category/${c.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...collections.map((c) => ({ url: url(`/collections/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({
      url: url(`/products/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: p.image ? [media(p.image)!] : undefined,
    })),
    ...posts.map((p) => ({
      url: url(`/blog/${p.slug}`),
      lastModified: p.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
