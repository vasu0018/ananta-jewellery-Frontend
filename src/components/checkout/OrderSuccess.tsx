"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Copy, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Img } from "@/components/ui/Img";
import { FormError } from "@/components/forms/Field";
import { usePayment } from "./PaymentProvider";
import { LAST_ORDER_KEY } from "@/lib/config";
import { useHydrated } from "@/hooks/useNow";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, inr } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import type { RazorpayPayload, TrackResult } from "@/lib/types";

function readLastOrder(orderNumber: string): string | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) ?? "null") as { orderNumber: string; email: string } | null;
    return v?.orderNumber === orderNumber ? v.email : null;
  } catch {
    return null;
  }
}

/** Thank-you page; offers to finish payment when an online payment was dismissed or failed. */
export function OrderSuccess({ orderNumber, payment }: { orderNumber: string; payment?: string }) {
  const hydrated = useHydrated();
  const status = useAuth((s) => s.status);
  const pay = usePayment();
  const email = hydrated ? readLastOrder(orderNumber) : null;
  const [retrying, setRetrying] = useState(false);
  const [payError, setPayError] = useState<string | null>(payment === "failed" ? "Your payment didn't go through. No money was deducted — you can try again below." : null);

  const order = useQuery({
    queryKey: ["order-confirmation", orderNumber, status, email],
    queryFn: () =>
      status === "authenticated"
        ? api<TrackResult>(`/account/orders/${encodeURIComponent(orderNumber)}`)
        : api<TrackResult>(`/checkout/track?order=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(email ?? "")}`),
    enabled: hydrated && status !== "loading" && (status === "authenticated" || !!email),
  });

  const o = order.data;
  const unpaid = o && o.paymentMethod === "RAZORPAY" && o.paymentStatus !== "PAID" && o.status === "PENDING";

  const retry = async () => {
    setRetrying(true);
    setPayError(null);
    try {
      const res = await api<{ razorpay: RazorpayPayload }>(`/checkout/orders/${encodeURIComponent(orderNumber)}/pay`, { body: email ? { email } : {} });
      const r = await pay(res.razorpay);
      if (r.status === "failed") setPayError(r.message);
      if (r.status === "paid") toast.success("Payment received — thank you!");
      await order.refetch();
    } catch (e) {
      setPayError(errorMessage(e));
    } finally {
      setRetrying(false);
    }
  };

  const copy = () => {
    void navigator.clipboard?.writeText(orderNumber).then(() => toast.success("Order number copied"));
  };

  const trackHref = `/track-order?order=${encodeURIComponent(orderNumber)}${email ? `&contact=${encodeURIComponent(email)}` : ""}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className={`mx-auto mb-5 grid size-20 place-items-center rounded-full ${unpaid ? "bg-gold-soft/60 text-gold" : "bg-[#e6f3ec] text-success"}`}>
          {unpaid ? <Clock className="size-9" /> : <CheckCircle2 className="size-9" />}
        </div>
        <p className="eyebrow mb-2">{unpaid ? "Payment pending" : "Order confirmed"}</p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">{unpaid ? "Almost there" : "Thank you for your order"}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
          {unpaid
            ? "We've reserved your pieces. Complete the payment to confirm your order."
            : `We've received your order and sent a confirmation${email ? ` to ${email}` : " to your email"}. We'll let you know as soon as it ships.`}
        </p>
        <button type="button" onClick={copy} className="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-cream">
          Order <span className="font-mono font-semibold">{orderNumber}</span> <Copy className="size-3.5 text-muted" />
        </button>
      </div>

      {unpaid && (
        <div className="mt-8 space-y-3 rounded-2xl border border-gold/40 bg-gold-soft/20 p-5 text-center">
          <FormError message={payError} />
          <Button size="lg" onClick={() => void retry()} loading={retrying}>
            Complete payment · {inr(o.total)}
          </Button>
          <p className="text-xs text-muted">Unpaid orders are cancelled automatically after a while.</p>
        </div>
      )}

      <div className="mt-10 rounded-2xl bg-cream p-5 sm:p-6">
        {order.isLoading || (!o && !order.isError && (status === "authenticated" || !!email)) ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : o ? (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-4">
              <p className="text-sm text-ink-soft">Placed {formatDateTime(o.placedAt)}</p>
              <p className="text-sm">
                <span className="text-muted">Status:</span> <span className="font-medium text-ink">{o.statusLabel}</span>
              </p>
            </div>
            <ul className="divide-y divide-line">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-4 py-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Img src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-1 text-ink">{i.name}</p>
                    <p className="text-xs text-muted">
                      {i.variantTitle ? `${i.variantTitle} · ` : ""}Qty {i.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm text-ink-soft">{o.paymentMethod === "COD" ? "Pay on delivery" : o.paymentStatus === "PAID" ? "Paid online" : "Amount due"}</span>
              <span className="text-xl font-semibold text-ink">{inr(o.total)}</span>
            </div>
          </>
        ) : (
          <p className="flex items-center gap-3 text-sm text-ink-soft">
            <Package className="size-5 text-gold" /> Use your order number and email on the tracking page to see live updates.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href={status === "authenticated" ? `/account/orders/${encodeURIComponent(orderNumber)}` : trackHref}>
            <Package className="size-4" /> {status === "authenticated" ? "View order" : "Track order"}
          </Link>
        </Button>
        <Button asChild>
          <Link href="/shop">
            <ShoppingBag className="size-4" /> Continue shopping
          </Link>
        </Button>
      </div>

      {status === "guest" && (
        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/register" className="font-medium text-rose-dark underline-offset-4 hover:underline">
            Create an account
          </Link>{" "}
          with the same email to track orders, earn Ananta points and check out faster.
        </p>
      )}
    </div>
  );
}
