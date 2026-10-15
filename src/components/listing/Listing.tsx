import Link from "next/link";
import { SearchX } from "lucide-react";
import { ListingProvider, ListingResults } from "./ListingProvider";
import { Toolbar } from "./Toolbar";
import { Pagination } from "./Pagination";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { JsonLd } from "@/components/seo/JsonLd";
import { apiQuery, activeFilterCount, readParams, type SearchParams } from "@/lib/listing";
import { getJson } from "@/lib/server-api";
import { SITE_URL } from "@/lib/config";
import type { Facets, Paged, ProductCard as Product } from "@/lib/types";

type Props = {
  searchParams: SearchParams;
  /** Fixed scope for the page, e.g. `{ category: "rings" }`. */
  base?: Record<string, string>;
  /** Filter groups the page scope makes redundant. */
  hide?: string[];
  /** Shown above the grid (subcategory chips, etc.). */
  intro?: React.ReactNode;
  emptyHint?: string;
  /** Shown with the result count, e.g. "Rings (24 Designs)". */
  title?: string;
};

/** Server-rendered product listing with URL-driven filters, sort and pagination. */
export async function Listing({ searchParams, base = {}, hide = [], intro, emptyHint, title }: Props) {
  const params = readParams(searchParams);
  const data = await getJson<Paged<Product> & { facets: Facets }>(`/catalog/products?${apiQuery(params, base)}`, { revalidate: 30 });
  const filtered = activeFilterCount(params, hide) > 0;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: data.items.map((p, i) => ({
      "@type": "ListItem",
      position: (params.page - 1) * data.meta.limit + i + 1,
      url: `${SITE_URL}/products/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <ListingProvider>
      <JsonLd data={itemList} />
      <div className="min-w-0">
        {intro}
        <Toolbar total={data.meta.total} facets={data.facets} hide={hide} title={title} />
        <ListingResults>
          {data.items.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
            ) : (
              <EmptyState
                icon={<SearchX />}
                title={filtered ? "No pieces match these filters" : "Nothing here yet"}
                description={filtered ? "Try removing a filter or widening the price range." : (emptyHint ?? "New designs are on their way — check back soon.")}
                action={
                  <Button asChild variant="outline">
                    <Link href="/shop?sort=popular">Browse bestsellers</Link>
                  </Button>
                }
              />
            )}
            <Pagination page={data.meta.page} totalPages={data.meta.pages} />
          </ListingResults>
      </div>
    </ListingProvider>
  );
}
