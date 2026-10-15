"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { QtyStepper } from "./QtyStepper";
import { inr } from "@/lib/format";
import { useCart } from "@/stores/cart";
import { useWishlistToggle } from "@/hooks/useShop";
import type { QuoteLine } from "@/lib/types";

/** One bag row: image, name, variant, price, quantity stepper and remove / save-for-later. */
export function BagLine({ line, onNavigate, large }: { line: QuoteLine; onNavigate?: () => void; large?: boolean }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const wishlist = useWishlistToggle();
  const short = line.available < line.quantity;

  const moveToWishlist = () => {
    if (!wishlist.isSaved(line.productId)) void wishlist.toggle({ id: line.productId, name: line.name });
    remove(line.variantId);
  };

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${line.slug}`}
        onClick={onNavigate}
        className={`relative shrink-0 overflow-hidden rounded-xl bg-cream ${large ? "size-28 sm:size-32" : "size-24"}`}
      >
        <Img src={line.image} alt={line.name} fill sizes="128px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.slug}`} onClick={onNavigate} className="line-clamp-2 text-[14px] leading-snug text-ink hover:text-rose-dark">
              {line.name}
            </Link>
            {line.variantTitle && <p className="mt-0.5 text-xs text-muted">{line.variantTitle}</p>}
          </div>
          <button type="button" onClick={() => remove(line.variantId)} className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink" aria-label={`Remove ${line.name}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-ink">{inr(line.unitPrice)}</span>
          {line.compareAtPrice && line.compareAtPrice > line.unitPrice && <span className="ml-2 text-xs text-muted line-through">{inr(line.compareAtPrice)}</span>}
        </p>
        {short && (
          <p className="mt-1 text-xs font-medium text-danger">{line.available > 0 ? `Only ${line.available} left — reduce quantity` : "Out of stock — remove to continue"}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QtyStepper value={line.quantity} max={Math.max(line.available, 1)} onChange={(n) => setQuantity(line.variantId, n)} />
          <button type="button" onClick={moveToWishlist} className="inline-flex items-center gap-1 text-xs text-muted hover:text-rose-dark">
            <Heart className="size-3.5" /> Save for later
          </button>
        </div>
      </div>
    </div>
  );
}
