"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_COMPARE } from "@/lib/config";
import type { ProductCard } from "@/lib/types";

// ─────────────────────────────── Wishlist ────────────────────────────────────

type WishlistState = {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  setAll: (ids: string[]) => void;
};

/** Saved product ids. Guests keep them locally; signed-in shoppers mirror the server list. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) => set((s) => (s.ids.includes(id) ? s : { ids: [id, ...s.ids] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      setAll: (ids) => set({ ids }),
    }),
    { name: "aj-wishlist", skipHydration: true },
  ),
);

// ─────────────────────────────── Compare ─────────────────────────────────────

type CompareState = {
  items: ProductCard[];
  toggle: (p: ProductCard) => "added" | "removed" | "full";
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (p) => {
        const { items } = get();
        if (items.some((i) => i.id === p.id)) {
          set({ items: items.filter((i) => i.id !== p.id) });
          return "removed";
        }
        if (items.length >= MAX_COMPARE) return "full";
        set({ items: [...items, p] });
        return "added";
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "aj-compare", skipHydration: true },
  ),
);

// ─────────────────────────── Recently viewed ─────────────────────────────────

type RecentState = { ids: string[]; push: (id: string) => void };

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 12) })),
    }),
    { name: "aj-recent", skipHydration: true },
  ),
);

type Persisted = { persist: { hasHydrated: () => boolean; onFinishHydration: (cb: () => void) => () => void } };

/** True once a persisted list has been read from localStorage (false during SSR, where `persist` doesn't exist). */
function useHydratedStore(store: Persisted) {
  return useSyncExternalStore(
    (cb) => store.persist.onFinishHydration(cb),
    () => store.persist.hasHydrated(),
    () => false,
  );
}

export const useWishlistHydrated = () => useHydratedStore(useWishlist);
export const useCompareHydrated = () => useHydratedStore(useCompare);
