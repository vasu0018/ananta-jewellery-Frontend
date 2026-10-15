import { Check, ExternalLink, Truck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { offPathMessage, ORDER_STEPS, shipmentEventLabel, statusTone, stepIndex } from "@/lib/orders";
import { cn } from "@/lib/utils";
import type { OrderEvent, OrderStatus, Shipment } from "@/lib/types";

export function StatusPill({ status, label, className }: { status: OrderStatus; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em]", statusTone(status), className)}>
      {label}
    </span>
  );
}

/** Horizontal progress tracker for the fulfilment steps. */
export function ProgressSteps({ status, statusLabel }: { status: OrderStatus; statusLabel: string }) {
  const reached = stepIndex(status);
  if (reached === null) {
    return <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-6 text-ink-soft">{offPathMessage(status, statusLabel)}</p>;
  }
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {ORDER_STEPS.map((s, i) => {
        const done = i <= reached;
        return (
          <li key={s.status} className="relative flex flex-col items-center text-center" aria-current={i === reached ? "step" : undefined}>
            {i > 0 && <span className={cn("absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2", i <= reached ? "bg-success" : "bg-line")} aria-hidden />}
            <span
              className={cn(
                "relative z-10 grid size-7 place-items-center rounded-full border-2 text-[11px] font-semibold",
                done ? "border-success bg-success text-white" : "border-line bg-white text-muted",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("mt-2 text-[11px] leading-tight sm:text-xs", done ? "text-ink" : "text-muted")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Customer-visible order history, newest first. */
export function EventList({ events }: { events: OrderEvent[] }) {
  if (!events.length) return null;
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {[...events].reverse().map((e, i) => (
        <li key={`${e.createdAt}-${i}`} className="relative">
          <span className={cn("absolute -left-[29px] top-1 size-2.5 rounded-full ring-4 ring-white", i === 0 ? "bg-rose" : "bg-line-strong")} aria-hidden />
          <p className="text-sm font-medium text-ink">{e.title}</p>
          {e.note && <p className="mt-0.5 text-[13px] text-ink-soft">{e.note}</p>}
          <p className="mt-0.5 text-xs text-muted">{formatDateTime(e.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Truck className="size-4 text-gold" />
          {shipment.courierName ?? "Courier"}
          {shipment.awb && <span className="font-mono text-xs text-muted">AWB {shipment.awb}</span>}
        </p>
        {shipment.trackingUrl && (
          <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-rose-dark hover:underline">
            Track on courier site <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      {shipment.events.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-line pt-3">
          {shipment.events.map((ev) => (
            <li key={ev.id} className="flex justify-between gap-4 text-[13px]">
              <span className="text-ink-soft">
                {ev.note ?? shipmentEventLabel(ev.status)}
                {ev.location && <span className="text-muted"> · {ev.location}</span>}
              </span>
              <span className="shrink-0 text-xs text-muted">{formatDateTime(ev.occurredAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
