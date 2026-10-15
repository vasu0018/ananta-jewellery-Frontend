import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { StatusPill } from "@/components/orders/OrderTimeline";
import { formatDate, inr } from "@/lib/format";
import type { OrderSummary } from "@/lib/types";

/** One row in the orders list: status, thumbnails and total. */
export function OrderCard({ order }: { order: OrderSummary }) {
  const shown = order.items.slice(0, 4);
  const extra = order.items.length - shown.length;
  const count = order.items.reduce((n, i) => n + i.quantity, 0);
  const awaitingPayment = order.paymentMethod === "RAZORPAY" && order.paymentStatus !== "PAID" && order.status === "PENDING";

  return (
    <Link
      href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
      className="group block rounded-2xl border border-line p-4 transition hover:border-line-strong hover:shadow-soft sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-mono font-semibold text-ink">{order.orderNumber}</span>
          <span className="text-muted"> · {formatDate(order.placedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          {awaitingPayment && <span className="text-xs font-medium text-rose-dark">Payment pending</span>}
          <StatusPill status={order.status} label={order.statusLabel} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex -space-x-3">
          {shown.map((i, idx) => (
            <div key={idx} className="relative size-14 overflow-hidden rounded-xl border-2 border-white bg-cream">
              <Img src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
            </div>
          ))}
          {extra > 0 && <div className="relative grid size-14 place-items-center rounded-xl border-2 border-white bg-cream text-xs font-medium text-ink-soft">+{extra}</div>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm text-ink">{order.items[0]?.name}</p>
          <p className="text-xs text-muted">
            {count} {count === 1 ? "item" : "items"} · {inr(order.total)}
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
    </Link>
  );
}
