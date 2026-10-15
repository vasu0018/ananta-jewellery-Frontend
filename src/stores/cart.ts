"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QTY } from "@/lib/config";

export type CartItem = { variantId: string; quantity: number };

type CartState = {
  items: CartItem[];
  couponCode: string | null;
  /** Chosen on the product page, applied at checkout. */
  giftWrap: boolean;
  setGiftWrap: (on: boolean) => void;
  /** Bumped on every local change; the sync effect only pushes when this moves. */
  revision: number;
  add: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
  /** Replace with the server copy (after login/merge) without triggering a push. */
  hydrateFromServer: (items: CartItem[], couponCode: string | null) => void;
};

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

/** Bag contents only — prices always come from the API quote. */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      giftWrap: false,
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      revision: 0,
      add: (variantId, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === variantId);
          const items = existing
            ? s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(i.quantity + quantity) } : i))
            : [...s.items, { variantId, quantity: clamp(quantity) }];
          return { items, revision: s.revision + 1 };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity) } : i)),
          revision: s.revision + 1,
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId), revision: s.revision + 1 })),
      setCoupon: (couponCode) => set((s) => ({ couponCode, revision: s.revision + 1 })),
      clear: () => set((s) => ({ items: [], couponCode: null, giftWrap: false, revision: s.revision + 1 })),
      hydrateFromServer: (items, couponCode) => set({ items, couponCode }),
    }),
    {
      name: "aj-cart",
      skipHydration: true,
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode, giftWrap: s.giftWrap }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);

const subscribeHydration = (cb: () => void) => useCart.persist.onFinishHydration(cb);

/** True once the persisted bag has been read from localStorage (false during SSR). */
export function useCartHydrated() {
  return useSyncExternalStore(subscribeHydration, () => useCart.persist.hasHydrated(), () => false);
}
