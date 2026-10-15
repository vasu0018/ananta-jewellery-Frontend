"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import type { CartItem } from "@/stores/cart";
import type { Quote } from "@/lib/types";

export type QuoteInput = {
  items: CartItem[];
  couponCode?: string | null;
  state?: string;
  pincode?: string;
  paymentMethod?: "RAZORPAY" | "COD";
  shippingRateId?: string | null;
  giftWrap?: boolean;
  loyaltyPoints?: number;
  email?: string;
};

/**
 * Server-priced bag: totals, coupon validation, group discount, shipping options and
 * stock warnings. The previous quote stays on screen while a new one loads.
 */
export function useQuote(input: QuoteInput, enabled = true) {
  const status = useAuth((s) => s.status);
  return useQuery({
    queryKey: ["quote", status, input],
    queryFn: ({ signal }) => api<Quote>("/checkout/quote", { body: input, signal }),
    enabled: enabled && input.items.length > 0 && status !== "loading",
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}
