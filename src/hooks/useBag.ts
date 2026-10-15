"use client";

import { useEffect, useMemo } from "react";
import { useCart } from "@/stores/cart";
import { useQuote, type QuoteInput } from "./useQuote";

/**
 * Bag contents priced by the API. Lines come back in bag order; variants the API
 * dropped (unpublished/deleted) are pruned from the local bag.
 */
export function useBag(extra: Omit<QuoteInput, "items" | "couponCode"> = {}, enabled = true) {
  const items = useCart((s) => s.items);
  const couponCode = useCart((s) => s.couponCode);
  const query = useQuote({ items, couponCode, ...extra }, enabled);
  const quote = items.length ? query.data : undefined;

  useEffect(() => {
    if (!query.data || query.isPlaceholderData) return;
    const known = new Set(query.data.lines.map((l) => l.variantId));
    const { items: current, remove } = useCart.getState();
    for (const i of current) if (!known.has(i.variantId)) remove(i.variantId);
  }, [query.data, query.isPlaceholderData]);

  const lines = useMemo(() => {
    if (!quote) return [];
    const order = new Map(items.map((i, idx) => [i.variantId, idx]));
    return [...quote.lines].filter((l) => order.has(l.variantId)).sort((a, b) => order.get(a.variantId)! - order.get(b.variantId)!);
  }, [quote, items]);

  const stockIssue = lines.some((l) => l.available < l.quantity);

  return {
    items,
    couponCode,
    quote,
    lines,
    stockIssue,
    isLoading: items.length > 0 && !query.data,
    isFetching: query.isFetching,
    error: query.error,
  };
}
