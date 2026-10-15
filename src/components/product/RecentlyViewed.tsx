"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductRail } from "./ProductRail";
import { api } from "@/lib/api";
import { useRecentlyViewed } from "@/stores/lists";
import type { Paged, ProductCard } from "@/lib/types";

/** Products the shopper looked at recently (excluding `excludeId`), newest first. */
export function RecentlyViewed({ excludeId, title = "Recently viewed" }: { excludeId?: string; title?: string }) {
  const ids = useRecentlyViewed((s) => s.ids).filter((id) => id !== excludeId).slice(0, 8);
  const { data } = useQuery({
    queryKey: ["products-by-id", ids],
    queryFn: () => api<Paged<ProductCard>>(`/catalog/products?ids=${ids.join(",")}&limit=${ids.length}`),
    enabled: ids.length > 0,
    staleTime: 60_000,
  });
  if (!ids.length || !data?.items.length) return null;
  const order = new Map(ids.map((id, i) => [id, i]));
  const items = [...data.items].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-3xl text-ink">{title}</h2>
      <ProductRail products={items} />
    </section>
  );
}
