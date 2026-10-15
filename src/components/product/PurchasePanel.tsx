"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, ChevronDown, Gem, GitCompareArrows, Gift, Heart, RefreshCcw, Share2, Tag, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Countdown } from "./Countdown";
import { PincodeCheck } from "./PincodeCheck";
import { SizeGuide } from "./SizeGuide";
import { VariantPicker, sizeLabelFor } from "./VariantPicker";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useAddToCart, useCompareToggle, useWishlistToggle } from "@/hooks/useShop";
import { bestCoupon, useOffers } from "@/hooks/useOffers";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { toCard } from "@/lib/product";
import type { Offer, ProductDetail, ProductVariant } from "@/lib/types";

function offerText(o: Offer) {
  if (o.description) return o.description;
  if (o.type === "PERCENTAGE") return `${o.value}% off${o.maxDiscount ? ` up to ${inr(o.maxDiscount)}` : ""}`;
  if (o.type === "FIXED") return `Flat ${inr(o.value ?? 0)} off`;
  if (o.type === "FREE_SHIPPING") return "Free shipping";
  return "Special offer";
}

function OffersCard({ offers }: { offers: Offer[] }) {
  const [all, setAll] = useState(false);
  const list = all ? offers : offers.slice(0, 2);
  return (
    <div className="rounded-[10px] border border-line p-4">
      <p className="mb-3 text-[16px] font-bold text-ink">Offers For You</p>
      <ul className="space-y-2.5">
        {list.map((o) => (
          <li key={o.code} className="flex items-start gap-3 rounded-[8px] bg-[#fff4f6] p-3">
            <Tag className="mt-0.5 size-4 shrink-0 text-rose" />
            <div className="min-w-0 flex-1 text-[13.5px]">
              <p className="text-ink">{offerText(o)}</p>
              {(o.minOrderValue || o.firstOrderOnly) && (
                <p className="mt-0.5 text-[12.5px] text-[#121212a6]">
                  {o.minOrderValue ? `On orders above ${inr(o.minOrderValue)}` : null}
                  {o.minOrderValue && o.firstOrderOnly ? " · " : null}
                  {o.firstOrderOnly ? "First order only" : null}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(o.code);
                toast.success(`Code ${o.code} copied`, { description: "Apply it at checkout." });
              }}
              className="shrink-0 rounded-[4px] border border-dashed border-rose px-2 py-0.5 text-[12px] font-bold tracking-wider text-rose-dark hover:bg-blush"
            >
              {o.code}
            </button>
          </li>
        ))}
      </ul>
      {offers.length > 2 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-rose">
          {all ? "Show less" : `+${offers.length - 2} more offers`}
          <ChevronDown className={cn("size-4 transition-transform", all && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

export function PurchasePanel({
  product,
  variant,
  onVariantChange,
  compact,
}: {
  product: ProductDetail;
  variant: ProductVariant | null;
  onVariantChange: (id: string) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const settings = useSettings();
  const addToCart = useAddToCart();
  const wishlist = useWishlistToggle();
  const compare = useCompareToggle();
  const inBag = useCart((s) => s.items.find((i) => i.variantId === variant?.id)?.quantity ?? 0);
  const giftWrap = useCart((s) => s.giftWrap);
  const setGiftWrap = useCart((s) => s.setGiftWrap);
  const [guideOpen, setGuideOpen] = useState(false);
  const setQuickView = useUi((s) => s.setQuickView);
  const offers = useOffers();

  const price = variant ?? product;
  const stock = variant ? variant.stock : product.stock;
  const soldOut = stock <= 0;
  const allInBag = !soldOut && inBag >= stock;
  const saved = wishlist.isSaved(product.id);
  const needsVariant = product.variants.length > 1 && !variant;
  const coupon = bestCoupon(price.price, offers.data);
  const hasMrp = !!price.compareAtPrice && price.compareAtPrice > price.price;
  const wrapFee = settings.checkout.giftWrapFee;

  const add = (thenCheckout = false) => {
    if (needsVariant) {
      toast.error("Please choose a size first");
      return;
    }
    if (compact) setQuickView(null);
    if (!allInBag) addToCart(variant?.id ?? product.variants[0]?.id, 1, { openDrawer: !thenCheckout });
    if (thenCheckout) router.push("/checkout");
  };

  const share = async () => {
    const url = window.location.origin + `/products/${product.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // Share sheet dismissed.
    }
  };

  const Title = compact ? "h2" : "h1";

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-[26px] font-bold text-ink sm:text-[30px]">{inr(price.price)}</span>
            {hasMrp && <span className="text-[18px] text-[#8a8a8a] line-through">{inr(price.compareAtPrice)}</span>}
            {!!price.discountPct && price.discountPct > 0 && <span className="text-[16px] font-bold text-rose">{price.discountPct}% OFF</span>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => void wishlist.toggle(product)}
              className="grid size-10 place-items-center rounded-full text-rose transition hover:bg-blush"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={saved}
            >
              <Heart className={cn("size-[22px]", saved && "fill-current")} strokeWidth={1.6} />
            </button>
            {!compact && (
              <button type="button" onClick={share} className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-cream" aria-label="Share">
                <Share2 className="size-5" strokeWidth={1.6} />
              </button>
            )}
          </div>
        </div>
        <p className="text-[13px] text-[#121212a6]">MRP Incl. of all taxes</p>

        <Title className="mt-3 text-[19px] font-normal leading-snug text-[#121212bf] sm:text-[21px]">{product.name}</Title>
        {product.material && <p className="mt-1 text-[14.5px] text-ink">Made with {product.material}</p>}
        {product.ratingCount > 0 && (
          <a href={compact ? `/products/${product.slug}#reviews` : "#reviews"} className="mt-2 inline-flex items-center gap-1.5 rounded-[4px] bg-[#f2f2f2] px-2 py-0.5 text-[13px] text-ink hover:bg-line">
            {product.ratingAvg.toFixed(1)} <span className="text-gold">★</span> <span className="text-[#121212a6]">| {product.ratingCount} reviews</span>
          </a>
        )}
      </div>

      {coupon && (
        <div className="rounded-[8px] px-4 py-2.5 text-[14.5px] text-coupon" style={{ background: "linear-gradient(90deg,#e3ebff 0%,#f6e9ff 100%)" }}>
          Get it for <span className="font-black">{inr(coupon.price)}</span> with coupon <span className="font-black">{coupon.code}</span>
        </div>
      )}

      {product.flashSale && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-maroon-grad px-4 py-2.5 text-white">
          <p className="flex items-center gap-2 text-[14px] font-bold">
            <Zap className="size-4 fill-current" /> {product.flashSale.name}
          </p>
          <p className="text-[13.5px]">
            Ends in <Countdown endsAt={product.flashSale.endsAt} compact className="font-bold" />
          </p>
        </div>
      )}

      <VariantPicker
        variants={product.variants}
        value={variant?.id ?? null}
        onChange={onVariantChange}
        sizeLabel={sizeLabelFor(product.variants, product.category?.slug)}
        onSizeGuide={product.sizeGuide ? () => setGuideOpen(true) : undefined}
      />

      {!soldOut && stock <= 5 && <p className="text-[14px] font-bold text-rose-dark">Hurry — only {stock} left in stock</p>}

      {!compact && (
        <>
          <PincodeCheck variantId={variant?.id ?? product.variants[0]?.id ?? null} />
          <ul className="grid grid-cols-2 gap-2.5">
            {[
              { icon: RefreshCcw, label: "Easy 30 Day Return" },
              { icon: Gem, label: "Lifetime Plating" },
              { icon: Truck, label: `Free Shipping above ${inr(settings.checkout.freeShippingAbove)}` },
              { icon: BadgeCheck, label: product.hasCertificate ? "Certified & Hallmarked" : "Fine 925 Silver" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-[8px] bg-cream px-3 py-2.5 text-[13px] text-ink">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blush text-rose-dark">
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-line px-4 py-3 text-[14px] text-ink">
            <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="size-4 accent-[#e9718b]" />
            <Gift className="size-5 text-rose" strokeWidth={1.6} />
            <span>
              Is this a gift? <span className="font-bold">Wrap it {wrapFee > 0 ? `for just ${inr(wrapFee)}` : "for free"}</span>
            </span>
          </label>
        </>
      )}

      <div
        data-sticky-cta={compact ? undefined : ""}
        className={cn("grid grid-cols-2 gap-3", !compact && "max-lg:sticky max-lg:bottom-0 max-lg:z-20 max-lg:-mx-4 max-lg:border-t max-lg:border-line max-lg:bg-white max-lg:px-4 max-lg:py-3")}>
        <button
          type="button"
          onClick={() => add(true)}
          disabled={soldOut}
          className="h-[50px] rounded-[7px] border-2 border-rose bg-white text-[18px] font-bold text-rose transition hover:bg-[#fff4f6] disabled:opacity-50 sm:text-[20px]"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={() => add(false)}
          disabled={soldOut || allInBag}
          className="h-[50px] rounded-[7px] bg-rose text-[18px] font-bold text-white transition hover:bg-[#de5f7b] disabled:opacity-50 sm:text-[20px]"
        >
          {soldOut ? "Sold Out" : allInBag ? "In Your Cart" : "Add To Cart"}
        </button>
      </div>

      {compact ? (
        <Link href={`/products/${product.slug}`} onClick={() => setQuickView(null)} className="inline-block text-[14px] font-bold text-rose underline underline-offset-4">
          View full details
        </Link>
      ) : (
        <>
          {offers.data && offers.data.length > 0 && <OffersCard offers={offers.data} />}
          <button type="button" onClick={() => compare.toggle(toCard(product))} className="inline-flex items-center gap-2 text-[13.5px] text-[#121212bf] hover:text-ink">
            <GitCompareArrows className="size-4" />
            {compare.isCompared(product.id) ? "Added to compare" : "Add to compare"}
          </button>
        </>
      )}

      {product.sizeGuide && <SizeGuide kind={product.sizeGuide} open={guideOpen} onOpenChange={setGuideOpen} />}
    </div>
  );
}
