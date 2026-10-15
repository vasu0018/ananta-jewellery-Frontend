"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgePercent, ChevronDown, TicketPercent, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { inr, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import type { QuoteInput } from "@/hooks/useQuote";
import type { Offer, Quote } from "@/lib/types";

function offerTerms(o: Offer) {
  const bits: string[] = [];
  if (o.minOrderValue) bits.push(`min. order ${inr(o.minOrderValue)}`);
  if (o.maxDiscount) bits.push(`up to ${inr(o.maxDiscount)} off`);
  if (o.firstOrderOnly) bits.push("first order only");
  if (o.endsAt) bits.push(`ends ${formatDate(o.endsAt)}`);
  return bits.join(" · ");
}

/**
 * Coupon entry. A code is validated against a fresh quote before it is saved to the
 * bag, so an invalid code never sticks; a saved code that stops qualifying (e.g. the
 * bag dropped below the minimum) is flagged with the API's reason.
 */
export function CouponBox({ input, quote }: { input: Omit<QuoteInput, "couponCode">; quote: Quote | undefined }) {
  const couponCode = useCart((s) => s.couponCode);
  const setCoupon = useCart((s) => s.setCoupon);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const offers = useQuery({ queryKey: ["offers"], queryFn: () => api<Offer[]>("/checkout/offers"), staleTime: 300_000 });

  const apply = async (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    setBusy(true);
    setError(null);
    try {
      const q = await api<Quote>("/checkout/quote", { body: { ...input, couponCode: code } });
      if (q.couponError) {
        setError(q.couponError);
        return;
      }
      setCoupon(code);
      setValue("");
      setShowOffers(false);
      toast.success(q.couponDiscount > 0 ? `${code} applied — you save ${inr(q.couponDiscount)}` : `${code} applied`);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const applied = quote?.coupon;
  const stale = couponCode && quote?.couponError ? quote.couponError : null;
  const list = (offers.data ?? []).filter((o) => o.code !== applied?.code);

  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
        <TicketPercent className="size-4 text-rose" /> Coupons & offers
      </p>

      {applied ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-success/50 bg-[#f1f8f4] px-3 py-2.5">
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-semibold tracking-wide text-success">{applied.code}</p>
            <p className="truncate text-xs text-ink-soft">
              {quote.couponDiscount > 0 ? `You save ${inr(quote.couponDiscount)}` : quote.freeShipping ? "Free shipping unlocked" : applied.description}
            </p>
          </div>
          <button type="button" onClick={() => setCoupon(null)} className="text-xs font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
            Remove
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void apply(value);
          }}
          className="flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            aria-invalid={!!error}
            className="field h-11 flex-1 font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
            maxLength={40}
          />
          <Button type="submit" variant="outline" className="h-11" loading={busy} disabled={!value.trim()}>
            Apply
          </Button>
        </form>
      )}

      {(error || stale) && (
        <p className="mt-2 flex items-start justify-between gap-2 text-xs text-danger" role="alert">
          <span>{stale ? `${couponCode}: ${stale}` : error}</span>
          {stale && (
            <button type="button" onClick={() => setCoupon(null)} className="shrink-0 text-muted hover:text-ink" aria-label="Remove coupon">
              <X className="size-3.5" />
            </button>
          )}
        </p>
      )}

      {list.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowOffers((s) => !s)}
            className="flex w-full items-center justify-between text-[13px] font-medium text-rose-dark"
            aria-expanded={showOffers}
          >
            View {list.length} available {list.length === 1 ? "offer" : "offers"}
            <ChevronDown className={cn("size-4 transition-transform", showOffers && "rotate-180")} />
          </button>
          {showOffers && (
            <ul className="mt-3 space-y-2">
              {list.map((o) => (
                <li key={o.code} className="flex items-start gap-3 rounded-xl bg-cream px-3 py-2.5">
                  <BadgePercent className="mt-0.5 size-4 shrink-0 text-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[12.5px] font-semibold tracking-wide text-ink">{o.code}</p>
                    {o.description && <p className="text-xs text-ink-soft">{o.description}</p>}
                    {offerTerms(o) && <p className="mt-0.5 text-[11px] text-muted">{offerTerms(o)}</p>}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void apply(o.code)}
                    className="shrink-0 text-xs font-semibold uppercase tracking-wider text-rose-dark hover:text-ink disabled:opacity-50"
                  >
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
