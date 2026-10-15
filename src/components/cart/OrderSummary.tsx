import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/types";

function Row({ label, value, tone, hint }: { label: React.ReactNode; value: React.ReactNode; tone?: "success" | "muted"; hint?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-ink-soft">
        {label}
        {hint && <span className="ml-1 text-xs text-muted">{hint}</span>}
      </dt>
      <dd className={cn("shrink-0 tabular-nums", tone === "success" ? "text-success" : tone === "muted" ? "text-muted" : "text-ink")}>{value}</dd>
    </div>
  );
}

/** Price breakdown for a quote. `estimate` labels shipping as an estimate (cart page, before an address). */
export function OrderSummary({ quote, estimate }: { quote: Quote; estimate?: boolean }) {
  const shippingOriginal = quote.shippingOptions.find((o) => o.id === quote.shippingRateId)?.originalPrice ?? 0;
  return (
    <div>
      <dl className="space-y-2.5">
        <Row label={`Subtotal (${quote.itemCount} ${quote.itemCount === 1 ? "item" : "items"})`} value={inr(quote.subtotal)} />
        {quote.couponDiscount > 0 && <Row label="Coupon" hint={quote.couponCode ?? undefined} value={`−${inr(quote.couponDiscount)}`} tone="success" />}
        {quote.groupDiscount && (
          <Row label={`${quote.groupDiscount.name} discount`} hint={`${quote.groupDiscount.percent}%`} value={`−${inr(quote.groupDiscount.amount)}`} tone="success" />
        )}
        {quote.loyalty.value > 0 && <Row label="Ananta points" hint={`${quote.loyalty.applied} pts`} value={`−${inr(quote.loyalty.value)}`} tone="success" />}
        <Row
          label={estimate ? "Estimated shipping" : "Shipping"}
          hint={!estimate && quote.shippingMethod ? quote.shippingMethod : undefined}
          value={
            quote.shippingFee === 0 ? (
              <span className="text-success">
                {shippingOriginal > 0 && <span className="mr-1.5 text-xs text-muted line-through">{inr(shippingOriginal)}</span>}
                Free
              </span>
            ) : (
              inr(quote.shippingFee)
            )
          }
        />
        {quote.codFee > 0 && <Row label="Cash on delivery fee" value={inr(quote.codFee)} />}
        {quote.giftWrapFee > 0 && <Row label="Gift wrap" value={inr(quote.giftWrapFee)} />}
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-medium text-ink">Total</span>
        <span className="text-xl font-semibold tabular-nums text-ink">{inr(quote.total)}</span>
      </div>
      <p className="mt-1 text-right text-[11.5px] text-muted">Inclusive of {inr(quote.taxTotal)} GST</p>
      {quote.savings > 0 && (
        <p className="mt-3 rounded-xl bg-[#f1f8f4] px-3 py-2 text-center text-[13px] font-medium text-success">
          You&apos;re saving {inr(quote.savings)} on this order
        </p>
      )}
    </div>
  );
}
