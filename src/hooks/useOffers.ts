"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Offer } from "@/lib/types";

export function useOffers(enabled = true) {
  return useQuery({ queryKey: ["offers"], queryFn: () => api<Offer[]>("/checkout/offers"), enabled, staleTime: 300_000 });
}

/** Lowest price reachable with a single public coupon on one unit, or null when no coupon applies. */
export function bestCoupon(price: number, offers: Offer[] | undefined): { code: string; price: number } | null {
  let best: { code: string; price: number } | null = null;
  for (const o of offers ?? []) {
    if (o.minOrderValue && price < o.minOrderValue) continue;
    let off = 0;
    if (o.type === "PERCENTAGE" && o.value) off = Math.round((price * o.value) / 100);
    else if (o.type === "FIXED" && o.value) off = o.value;
    if (o.maxDiscount) off = Math.min(off, o.maxDiscount);
    off = Math.min(off, price);
    if (off > 0 && (!best || price - off < best.price)) best = { code: o.code, price: price - off };
  }
  return best;
}
