"use client";

import { useMemo, useState } from "react";
import { Gallery } from "./Gallery";
import { PurchasePanel } from "./PurchasePanel";
import type { ProductDetail } from "@/lib/types";

/** Gallery + buy box sharing the selected variant (variant images are shown first). */
export function ProductView({ product, compact }: { product: ProductDetail; compact?: boolean }) {
  const initial = product.variants.find((v) => v.stock > 0) ?? product.variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(initial?.id ?? null);
  const variant = product.variants.find((v) => v.id === variantId) ?? null;

  const images = useMemo(() => {
    const own = variant?.imageIds.length ? product.images.filter((i) => variant.imageIds.includes(i.id)) : [];
    const rest = product.images.filter((i) => !own.includes(i) && (!i.variantId || i.variantId === variant?.id));
    return [...own, ...rest];
  }, [product.images, variant]);

  return (
    <div className={compact ? "grid gap-6 sm:grid-cols-2" : "grid gap-6 lg:grid-cols-[424px_minmax(0,500px)] lg:justify-center lg:gap-16 xl:gap-[88px]"}>
      <div className={compact ? undefined : "lg:sticky lg:top-40 lg:self-start"}>
        <Gallery
          key={images.map((i) => i.id).join()}
          images={images}
          name={product.name}
          compact={compact}
          rating={{ avg: product.ratingAvg, count: product.ratingCount }}
        />
      </div>
      <PurchasePanel product={product} variant={variant} onVariantChange={setVariantId} compact={compact} />
    </div>
  );
}
