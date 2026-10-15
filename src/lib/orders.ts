import type { OrderStatus } from "./types";

/** Happy-path fulfilment steps shown on the progress tracker. */
export const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PACKED", label: "Packed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

/** Index of the step reached, -1 before confirmation; `null` when the order left the happy path. */
export function stepIndex(status: OrderStatus): number | null {
  if (status === "PENDING") return -1;
  const i = ORDER_STEPS.findIndex((s) => s.status === status);
  return i === -1 ? null : i;
}

export function statusTone(status: OrderStatus): string {
  switch (status) {
    case "DELIVERED":
      return "bg-[#e6f3ec] text-success";
    case "CANCELLED":
    case "RETURNED":
    case "REFUNDED":
      return "bg-[#f3eeee] text-muted";
    case "RETURN_REQUESTED":
      return "bg-blush text-rose-dark";
    case "PENDING":
      return "bg-gold-soft/50 text-[#7a5b2c]";
    default:
      return "bg-[#eef1f8] text-[#3d4f7a]";
  }
}

/** What happens next for orders that left the fulfilment path (cancelled, returns). */
export function offPathMessage(status: OrderStatus, statusLabel: string): string {
  switch (status) {
    case "CANCELLED":
      return "This order was cancelled. Any amount paid is refunded to the original payment method within 5–7 working days.";
    case "RETURN_REQUESTED":
      return "We've received your return request. A pickup will be scheduled within 48 hours, and your refund is issued once the piece reaches us.";
    case "RETURNED":
      return "This order has been returned. Your refund is on its way to the original payment method.";
    case "REFUNDED":
      return "This order has been refunded to the original payment method.";
    default:
      return `Current status: ${statusLabel}.`;
  }
}

const SHIPMENT_EVENT_LABELS: Record<string, string> = {
  CREATED: "Shipment created",
  PICKUP_SCHEDULED: "Pickup scheduled",
  PICKED_UP: "Picked up by courier",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  NDR: "Delivery attempt failed",
  RTO_INITIATED: "Returning to sender",
  RTO_DELIVERED: "Returned to sender",
  CANCELLED: "Shipment cancelled",
};

/** Readable label for a raw courier status code. */
export const shipmentEventLabel = (status: string) => SHIPMENT_EVENT_LABELS[status] ?? status.replace(/_/g, " ").toLowerCase();

export const canCancel = (status: OrderStatus) => status === "PENDING" || status === "CONFIRMED";

export const RETURN_WINDOW_DAYS = 30;

export function canReturn(status: OrderStatus, deliveredAt: string | null, now: number) {
  if (status !== "DELIVERED" || !deliveredAt) return false;
  return now - new Date(deliveredAt).getTime() <= RETURN_WINDOW_DAYS * 86_400_000;
}
