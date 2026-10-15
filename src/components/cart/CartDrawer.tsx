"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { BagLine } from "./BagLine";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { useBag } from "@/hooks/useBag";
import { inr } from "@/lib/format";
import { cartCount } from "@/stores/cart";
import { useUi } from "@/stores/ui";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const setOpen = useUi((s) => s.setCartOpen);
  const router = useRouter();
  const { items, quote, lines, isLoading, stockIssue } = useBag({}, open);
  const count = cartCount(items);
  const close = () => setOpen(false);

  const footer =
    items.length > 0 ? (
      <div className="space-y-3">
        {quote ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-soft">Subtotal</span>
              <span className="text-lg font-semibold text-ink">{inr(quote.subtotal)}</span>
            </div>
            {quote.savings > 0 && <p className="-mt-2 text-right text-xs font-medium text-success">You save {inr(quote.savings)}</p>}
          </>
        ) : (
          <Skeleton className="h-6 w-full" />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => { close(); router.push("/cart"); }}>
            View bag
          </Button>
          <Button disabled={stockIssue || !quote} onClick={() => { close(); router.push("/checkout"); }}>
            Checkout
          </Button>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-muted">
          <ShieldCheck className="size-3.5 text-success" /> Secure checkout · Taxes included · Easy 30-day returns
        </p>
      </div>
    ) : null;

  return (
    <Sheet open={open} onOpenChange={setOpen} title={`Your bag${count ? ` (${count})` : ""}`} footer={footer}>
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag />}
          title="Your bag is empty"
          description="Fill it with something that sparkles — bestsellers start at just ₹499."
          action={
            <Button asChild>
              <Link href="/shop?sort=popular" onClick={close}>
                Shop bestsellers
              </Link>
            </Button>
          }
        />
      ) : (
        <div>
          {quote && <FreeShippingMeter subtotal={quote.subtotal} freeShipping={quote.freeShipping} />}
          {isLoading ? (
            <div className="space-y-4 py-4">
              {items.map((i) => (
                <div key={i.variantId} className="flex gap-4">
                  <Skeleton className="size-24 rounded-xl" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {lines.map((line) => (
                <BagLine key={line.variantId} line={line} onNavigate={close} />
              ))}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
