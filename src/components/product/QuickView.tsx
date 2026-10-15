"use client";

import { useQuery } from "@tanstack/react-query";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/misc";
import { ProductView } from "./ProductView";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { useUi } from "@/stores/ui";
import type { ProductDetail } from "@/lib/types";

/** Product preview modal opened from listing cards. */
export function QuickView() {
  const slug = useUi((s) => s.quickView);
  const setQuickView = useUi((s) => s.setQuickView);
  const { data, error, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api<ProductDetail>(`/catalog/products/${slug}`),
    enabled: !!slug,
  });

  return (
    <Sheet
      open={!!slug}
      onOpenChange={(o) => !o && setQuickView(null)}
      side="center"
      title={data?.name ?? "Quick view"}
      hideTitle
      className="max-w-4xl"
      bodyClassName="p-5 sm:p-8"
    >
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : error ? (
        <p className="py-10 text-center text-sm text-muted">{errorMessage(error)}</p>
      ) : data ? (
        <ProductView key={data.id} product={data} compact />
      ) : null}
    </Sheet>
  );
}
