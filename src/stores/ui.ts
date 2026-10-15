"use client";

import { create } from "zustand";

type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  /** Slug of the product shown in the quick-view modal. */
  quickView: string | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setQuickView: (slug: string | null) => void;
};

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickView: null,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setQuickView: (quickView) => set({ quickView }),
}));
