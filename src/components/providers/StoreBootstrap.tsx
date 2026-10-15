"use client";

import { useEffect, useRef } from "react";
import { api, refreshSession } from "@/lib/api";
import { hasSessionHint, useAuth } from "@/stores/auth";
import { useCart, type CartItem } from "@/stores/cart";
import { useCompare, useRecentlyViewed, useWishlist } from "@/stores/lists";

type ServerCart = { items: CartItem[]; couponCode: string | null };

/**
 * Runs once per page load:
 * 1. rehydrates persisted stores (after the first render, so SSR markup matches),
 * 2. restores the session from the refresh cookie,
 * 3. merges the guest bag / wishlist into the account on sign-in, then mirrors bag edits to the API,
 * 4. registers the offline service worker (production only).
 */
export function StoreBootstrap() {
  const status = useAuth((s) => s.status);
  const revision = useCart((s) => s.revision);
  const merged = useRef(false);
  const pushedRevision = useRef(0);

  useEffect(() => {
    void Promise.all([
      useCart.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useCompare.persist.rehydrate(),
      useRecentlyViewed.persist.rehydrate(),
    ]).then(() => {
      if (hasSessionHint()) {
        void refreshSession().then((token) => {
          if (!token) useAuth.getState().clear();
        });
      } else {
        useAuth.getState().clear();
      }
    });

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if (!sessionStorage.getItem("aj-visit")) {
      sessionStorage.setItem("aj-visit", "1");
      void api("/content/track", { body: { event: "visit" } }).catch(() => undefined);
    }
  }, []);

  // Merge local lists into the account once per sign-in.
  useEffect(() => {
    if (status !== "authenticated") {
      merged.current = false;
      return;
    }
    if (merged.current) return;
    merged.current = true;
    const cart = useCart.getState();
    void api<ServerCart>("/cart/merge", { body: { items: cart.items } })
      .then((server) => {
        const coupon = server.couponCode ?? useCart.getState().couponCode;
        useCart.getState().hydrateFromServer(server.items, coupon);
        pushedRevision.current = useCart.getState().revision;
      })
      .catch(() => undefined);
    void api<{ productIds: string[] }>("/wishlist/merge", { body: { productIds: useWishlist.getState().ids } })
      .then((r) => useWishlist.getState().setAll(r.productIds))
      .catch(() => undefined);
  }, [status]);

  // Debounced push of bag edits for signed-in shoppers (powers abandoned-cart recovery and cross-device bags).
  useEffect(() => {
    if (status !== "authenticated" || !merged.current || revision === pushedRevision.current) return;
    const t = setTimeout(() => {
      const { items, couponCode, revision: rev } = useCart.getState();
      pushedRevision.current = rev;
      void api("/cart", { method: "PUT", body: { items, couponCode } }).catch(() => undefined);
    }, 600);
    return () => clearTimeout(t);
  }, [status, revision]);

  return null;
}
