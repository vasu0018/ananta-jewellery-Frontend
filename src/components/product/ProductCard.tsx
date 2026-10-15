"use client";

import Link from "next/link";
import { Heart, Zap } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { useAddToCart, useWishlistToggle } from "@/hooks/useShop";
import { bestCoupon, useOffers } from "@/hooks/useOffers";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUi } from "@/stores/ui";
import type { ProductCard as Product } from "@/lib/types";

/**
 * GIVA-style tile: image with ribbon + rating chip, price row with wishlist heart,
 * grey name, best coupon price and a pink Add to Cart. Multi-size products open quick view first.
 */
export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const wishlist = useWishlistToggle();
  const addToCart = useAddToCart();
  const setQuickView = useUi((s) => s.setQuickView);
  const { data: offers } = useOffers();
  const saved = wishlist.isSaved(product.id);
  const needsChoice = product.variants.length > 1;
  const href = `/products/${product.slug}`;
  const coupon = bestCoupon(product.price, offers);
  const hasMrp = !!product.compareAtPrice && product.compareAtPrice > product.price;

  const onAdd = () => (needsChoice ? setQuickView(product.slug) : addToCart(product.defaultVariantId));

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-cream">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <Img
            src={product.image}
            alt={product.name}
            fill
            preload={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw"
            className={cn("object-cover transition duration-500", product.hoverImage && "group-hover:opacity-0")}
          />
          {product.hoverImage && (
            <Img
              src={product.hoverImage}
              alt=""
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw"
              className="object-cover opacity-0 transition duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {(product.flashSale || product.isBestseller || product.isNewArrival) && (
          <span
            className="pointer-events-none absolute left-0 top-0 inline-flex items-center gap-1 bg-rose py-1 pl-2.5 pr-5 text-[12px] tracking-[0.4px] text-white sm:text-[14.4px]"
            style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)" }}
          >
            {product.flashSale ? (
              <>
                <Zap className="size-3 fill-current" /> Flash Sale
              </>
            ) : product.isBestseller ? (
              "Bestseller"
            ) : (
              "New Arrival"
            )}
          </span>
        )}
        {!product.inStock && <span className="pointer-events-none absolute right-2 top-2.5 rounded-[4px] bg-ink/80 px-2 py-0.5 text-[11px] font-bold text-white">Sold out</span>}

        {product.ratingCount > 0 && (
          <span className="pointer-events-none absolute bottom-0 left-0 inline-flex items-center gap-1 rounded-tr-[14.4px] bg-[#f2f2f2] px-2.5 py-1 text-[12px] text-ink sm:text-[14px]">
            {product.ratingAvg.toFixed(1)} <span className="text-gold">★</span>
            <span className="text-[#121212a6]">| {product.ratingCount}</span>
          </span>
        )}
        {product.hoverImage && <span className="pointer-events-none absolute bottom-1.5 right-2 text-[12px] font-bold text-rose max-sm:hidden">More images</span>}
      </div>

      <div className="flex flex-1 flex-col pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[16px] font-semibold tracking-normal text-ink sm:text-[18px]">{inr(product.price)}</span>
            {hasMrp && <span className="text-[12.5px] tracking-normal text-[#7d7d7d] line-through sm:text-[14px]">{inr(product.compareAtPrice)}</span>}
          </div>
          <button
            type="button"
            onClick={() => void wishlist.toggle(product)}
            className="-mr-1 -mt-0.5 grid size-8 shrink-0 place-items-center text-rose transition hover:scale-110"
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={saved}
          >
            <Heart className={cn("size-[20px]", saved && "fill-rose")} strokeWidth={1.6} />
          </button>
        </div>
        <Link
          href={href}
          className="truncate text-[14px] tracking-[0.72px] text-[#7d7d7d] transition hover:text-ink hover:underline sm:text-[17.28px]"
          title={product.name}
        >
          {product.name}
        </Link>
        {coupon && (
          <p className="text-[12.5px] tracking-normal text-coupon sm:text-[14.4px]">
            <span className="font-extrabold">Get it for {inr(coupon.price)}</span> <span className="text-ink/75">with coupon</span>
          </p>
        )}
        <div className="mt-auto pt-3">
          <button type="button" onClick={onAdd} disabled={!product.inStock} className="btn-cart">
            {!product.inStock ? "Sold out" : needsChoice ? "Choose Size" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
