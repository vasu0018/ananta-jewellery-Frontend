"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/ProductCard";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { useWishlist, useWishlistHydrated } from "@/stores/lists";
import type { Paged, ProductCard as Product } from "@/lib/types";

const MAX_SHOWN = 120;

/** Saved pieces. The id list is the source of truth (it mirrors the account once signed in). */
export function WishlistView() {
  const hydrated = useWishlistHydrated();
  const status = useAuth((s) => s.status);
  const ids = useWishlist((s) => s.ids).slice(0, MAX_SHOWN);

  const products = useQuery({
    queryKey: ["products-by-id", ids],
    queryFn: () => api<Paged<Product>>(`/catalog/products?ids=${ids.join(",")}&limit=${ids.length}`),
    enabled: hydrated && ids.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  if (!hydrated || (ids.length > 0 && products.isLoading)) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="aspect-square" />
            <Skeleton className="mt-3 h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const order = new Map(ids.map((id, i) => [id, i]));
  const items = (products.data?.items ?? []).filter((p) => order.has(p.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  if (!items.length) {
    return (
      <>
        <EmptyState
          icon={<Heart />}
          title="Your wishlist is empty"
          description="Tap the heart on any piece to save it here for later."
          action={
            <Button asChild>
              <Link href="/shop">Discover jewellery</Link>
            </Button>
          }
        />
        <RecentlyViewed />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {items.length} saved {items.length === 1 ? "piece" : "pieces"}
        </p>
        {status === "guest" && (
          <p>
            <Link href="/login?next=/wishlist" className="font-medium text-rose-dark underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            to keep your wishlist across devices.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <RecentlyViewed />
    </>
  );
}
