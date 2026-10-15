"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Lock, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { BagLine } from "./BagLine";
import { CouponBox } from "./CouponBox";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { OrderSummary } from "./OrderSummary";
import { useBag } from "@/hooks/useBag";
import { cartCount, useCartHydrated } from "@/stores/cart";

export function CartView() {
  const hydrated = useCartHydrated();
  const { items, quote, lines, isLoading, isFetching, stockIssue } = useBag();
  const count = cartCount(items);

  if (!hydrated) return <CartSkeleton />;

  if (!items.length) {
    return (
      <>
        <EmptyState
          icon={<ShoppingBag />}
          title="Your bag is empty"
          description="Looks like you haven't added anything yet. Explore bestsellers, new arrivals and gifts under ₹999."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/shop?sort=popular">Shop bestsellers</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/wishlist">View wishlist</Link>
              </Button>
            </div>
          }
        />
        <RecentlyViewed title="Pick up where you left off" />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <section aria-labelledby="bag-heading">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <h2 id="bag-heading" className="font-display text-2xl text-ink">
              {count} {count === 1 ? "item" : "items"}
            </h2>
            <Link href="/shop" className="text-sm text-rose-dark underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          </div>

          {quote?.warnings.length ? (
            <ul className="mt-4 space-y-1 rounded-xl bg-blush px-4 py-3 text-[13px] text-rose-dark">
              {quote.warnings.map((w) => (
                <li key={w} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          ) : null}

          {isLoading ? (
            <div className="space-y-6 py-6">
              {items.map((i) => (
                <div key={i.variantId} className="flex gap-4">
                  <Skeleton className="size-28 rounded-xl sm:size-32" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="mt-6 h-9 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {lines.map((line) => (
                <BagLine key={line.variantId} line={line} large />
              ))}
            </div>
          )}

          <ul className="mt-6 grid gap-3 border-t border-line pt-6 text-[13px] text-ink-soft sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-gold" /> Ships in 24–48 hours
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="size-4 text-gold" /> 30-day easy returns
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold" /> Certified 925 silver
            </li>
          </ul>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start" aria-label="Order summary">
          {quote && <FreeShippingMeter subtotal={quote.subtotal} freeShipping={quote.freeShipping} />}
          <CouponBox input={{ items }} quote={quote} />
          <div className={`rounded-2xl bg-cream p-5 transition-opacity ${isFetching ? "opacity-70" : ""}`}>
            <h2 className="mb-4 font-display text-xl text-ink">Order summary</h2>
            {quote ? <OrderSummary quote={quote} estimate /> : <Skeleton className="h-40 w-full" />}
            {stockIssue && <p className="mt-3 text-[13px] text-danger">Some items are short on stock. Update quantities to continue.</p>}
            <Button asChild={!stockIssue && !!quote} block size="lg" className="mt-4" disabled={stockIssue || !quote}>
              {!stockIssue && quote ? (
                <Link href="/checkout">
                  Proceed to checkout <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span>Proceed to checkout</span>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-muted">
              <Lock className="size-3" /> Secure payments · UPI, cards, net banking & COD
            </p>
          </div>
        </aside>
      </div>
      <RecentlyViewed title="Recently viewed" />
    </>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="size-32 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  );
}
