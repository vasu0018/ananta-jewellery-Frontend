"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, FileText, Gift, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Img } from "@/components/ui/Img";
import { Sheet } from "@/components/ui/sheet";
import { FormError, SelectField, TextareaField } from "@/components/forms/Field";
import { usePayment } from "@/components/checkout/PaymentProvider";
import { EventList, ProgressSteps, ShipmentCard, StatusPill } from "@/components/orders/OrderTimeline";
import { api, openAuthedFile } from "@/lib/api";
import { ApiError, errorMessage } from "@/lib/api-error";
import { formatDate, formatDateTime, inr } from "@/lib/format";
import { canCancel, canReturn, RETURN_WINDOW_DAYS } from "@/lib/orders";
import type { OrderDetail, RazorpayPayload } from "@/lib/types";

const CANCEL_REASONS = ["Ordered by mistake", "Found a better price", "Delivery is taking too long", "Want to change size or variant", "Other"];
const RETURN_REASONS = ["Size doesn't fit", "Looks different from the photos", "Received a damaged piece", "Received the wrong item", "Quality not as expected", "Other"];

type Dialog = "cancel" | "return" | null;

export function OrderDetailView({ orderNumber }: { orderNumber: string }) {
  const queryClient = useQueryClient();
  const pay = usePayment();
  const [now] = useState(() => Date.now());
  const [dialog, setDialog] = useState<Dialog>(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["account", "order", orderNumber],
    queryFn: () => api<OrderDetail>(`/account/orders/${encodeURIComponent(orderNumber)}`),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });
  const o = query.data;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["account"] });

  const openDialog = (d: Dialog) => {
    setReason("");
    setDetails("");
    setActionError(null);
    setDialog(d);
  };

  const submitAction = async () => {
    if (!dialog) return;
    const text = [reason, details.trim()].filter(Boolean).join(" — ");
    if (dialog === "return" && !reason) {
      setActionError("Please tell us why you're returning this order");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const res = await api<{ message: string }>(`/account/orders/${encodeURIComponent(orderNumber)}/${dialog}`, {
        body: text ? { reason: text } : {},
      });
      toast.success(res.message);
      setDialog(null);
      await refresh();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const payNow = async () => {
    setBusy(true);
    setPayError(null);
    try {
      const res = await api<{ razorpay: RazorpayPayload }>(`/checkout/orders/${encodeURIComponent(orderNumber)}/pay`, { body: {} });
      const r = await pay(res.razorpay);
      if (r.status === "failed") setPayError(r.message);
      if (r.status === "paid") toast.success("Payment received — your order is confirmed");
      await refresh();
    } catch (e) {
      setPayError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const invoice = () => {
    void openAuthedFile(`/account/orders/${encodeURIComponent(orderNumber)}/invoice`).catch((e: unknown) => toast.error(errorMessage(e)));
  };

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!o) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
        <p className="font-display text-2xl text-ink">We couldn&apos;t find that order</p>
        <p className="mt-2 text-sm text-muted">{query.error ? errorMessage(query.error) : "It may belong to a different account."}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const unpaid = o.paymentMethod === "RAZORPAY" && o.paymentStatus !== "PAID" && o.status === "PENDING";
  const returnable = canReturn(o.status, o.deliveredAt, now);
  const totals: [string, number, string?][] = [
    ["Subtotal", o.subtotal],
    [o.couponCode ? `Discount (${o.couponCode})` : "Discount", -o.discount],
    ["Ananta points", -o.loyaltyDiscount],
    [o.shippingMethod ? `Shipping · ${o.shippingMethod}` : "Shipping", o.shippingFee, "Free"],
    ["Cash on delivery fee", o.codFee],
    ["Gift wrap", o.giftWrapFee],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex flex-wrap items-center gap-3 font-display text-2xl text-ink sm:text-[28px]">
              Order <span className="font-sans text-xl font-medium tracking-wide tabular-nums sm:text-2xl">{o.orderNumber}</span>
              <StatusPill status={o.status} label={o.statusLabel} />
            </h2>
            <p className="mt-1 text-sm text-muted">Placed {formatDateTime(o.placedAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {o.invoiceNumber && (
              <Button variant="outline" size="sm" onClick={invoice}>
                <FileText className="size-4" /> Invoice
              </Button>
            )}
            {returnable && (
              <Button variant="outline" size="sm" onClick={() => openDialog("return")}>
                <RotateCcw className="size-4" /> Return
              </Button>
            )}
            {canCancel(o.status) && (
              <Button variant="ghost" size="sm" onClick={() => openDialog("cancel")} className="text-danger hover:bg-danger/5">
                <XCircle className="size-4" /> Cancel order
              </Button>
            )}
          </div>
        </div>
      </div>

      {unpaid && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold-soft/20 p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-gold" />
            <div>
              <p className="font-medium text-ink">Payment pending</p>
              <p className="text-sm text-ink-soft">Complete the payment to confirm this order. Unpaid orders are cancelled automatically.</p>
              <FormError message={payError} />
            </div>
          </div>
          <Button onClick={() => void payNow()} loading={busy}>
            Pay {inr(o.total)}
          </Button>
        </div>
      )}

      <section className="rounded-2xl border border-line p-5 sm:p-6">
        <ProgressSteps status={o.status} statusLabel={o.statusLabel} />
        {o.shipments.length > 0 && (
          <div className="mt-6 space-y-3">
            {o.shipments.map((s, i) => (
              <ShipmentCard key={s.awb ?? i} shipment={s} />
            ))}
          </div>
        )}
        {o.status === "DELIVERED" && o.deliveredAt && (
          <p className="mt-5 text-[13px] text-muted">
            Delivered on {formatDate(o.deliveredAt)}.{" "}
            {returnable ? `Returns are open for ${RETURN_WINDOW_DAYS} days after delivery.` : "The return window for this order has closed."}
          </p>
        )}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-line p-5 sm:p-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Items</h3>
          <ul className="divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                  <Img src={i.image} alt={i.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-ink">{i.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {i.variantTitle ? `${i.variantTitle} · ` : ""}SKU {i.sku}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {inr(i.unitPrice)} × {i.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-ink">{inr(i.total)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-cream p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Payment</h3>
            <dl className="space-y-2 text-sm">
              {totals
                .filter(([label, v]) => v !== 0 || label.startsWith("Subtotal") || label.startsWith("Shipping"))
                .map(([label, v, zero]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className={v < 0 ? "text-success" : "text-ink"}>{v === 0 && zero ? zero : v < 0 ? `−${inr(-v)}` : inr(v)}</dd>
                  </div>
                ))}
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd>{inr(o.total)}</dd>
              </div>
              {o.taxTotal > 0 && <p className="text-xs text-muted">Includes {inr(o.taxTotal)} GST</p>}
              <p className="pt-1 text-xs text-muted">
                {o.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"} · {o.paymentStatus.toLowerCase().replace(/_/g, " ")}
              </p>
              {o.refundedAmount > 0 && <p className="text-xs font-medium text-success">Refunded {inr(o.refundedAmount)}</p>}
            </dl>
          </section>

          <section className="rounded-2xl border border-line p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Delivery address</h3>
            <address className="text-sm not-italic leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{o.shippingAddress.name}</span>
              <br />
              {o.shippingAddress.line1}
              {o.shippingAddress.line2 && <>, {o.shippingAddress.line2}</>}
              {o.shippingAddress.landmark && (
                <>
                  <br />
                  Near {o.shippingAddress.landmark}
                </>
              )}
              <br />
              {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}
              <br />
              {o.shippingAddress.phone}
            </address>
            {o.giftWrap && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-blush/60 p-3 text-[13px] text-ink-soft">
                <Gift className="mt-0.5 size-4 shrink-0 text-rose" />
                <span>Gift wrapped{o.giftMessage ? ` · “${o.giftMessage}”` : ""}</span>
              </p>
            )}
          </section>
        </div>
      </div>

      {o.events.length > 0 && (
        <section className="rounded-2xl border border-line p-5 sm:p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Order history</h3>
          <EventList events={o.events} />
        </section>
      )}

      <p className="text-center text-sm text-muted">
        Need help with this order?{" "}
        <Link href={`/contact?order=${encodeURIComponent(o.orderNumber)}`} className="font-medium text-rose-dark underline-offset-4 hover:underline">
          Contact us
        </Link>
      </p>

      <Sheet
        open={dialog !== null}
        onOpenChange={(open) => !open && !busy && setDialog(null)}
        side="center"
        className="max-w-md"
        title={dialog === "return" ? "Request a return" : "Cancel this order?"}
        description={
          dialog === "return"
            ? "We'll arrange a free pickup within 48 hours. Refunds are issued once the piece passes a quality check."
            : o.paymentStatus === "PAID"
              ? "Your payment will be refunded to the original method within 5–7 business days."
              : "Items will be released back to stock."
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialog(null)} disabled={busy}>
              Keep order
            </Button>
            <Button variant={dialog === "cancel" ? "rose" : "primary"} onClick={() => void submitAction()} loading={busy}>
              {dialog === "return" ? "Request return" : "Cancel order"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormError message={actionError} />
          <SelectField label={dialog === "return" ? "Reason for return" : "Reason (optional)"} value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason</option>
            {(dialog === "return" ? RETURN_REASONS : CANCEL_REASONS).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </SelectField>
          <TextareaField label="Anything else? (optional)" rows={3} maxLength={250} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
      </Sheet>
    </div>
  );
}
