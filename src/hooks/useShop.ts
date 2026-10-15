"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { useAuth } from "@/stores/auth";
import { useCart } from "@/stores/cart";
import { useCompare, useWishlist } from "@/stores/lists";
import { useUi } from "@/stores/ui";
import type { ProductCard } from "@/lib/types";

function track(event: "add_to_cart" | "product_view" | "checkout") {
  void api("/content/track", { body: { event } }).catch(() => undefined);
}
export { track };

/** Add a variant to the bag and reveal the bag drawer. */
export function useAddToCart() {
  const add = useCart((s) => s.add);
  const setCartOpen = useUi((s) => s.setCartOpen);
  return (variantId: string | null | undefined, quantity = 1, { openDrawer = true } = {}) => {
    if (!variantId) {
      toast.error("This piece is currently unavailable");
      return;
    }
    add(variantId, quantity);
    track("add_to_cart");
    if (openDrawer) setCartOpen(true);
    else toast.success("Added to bag");
  };
}

/** Heart toggle: instant locally, mirrored to the account when signed in. */
export function useWishlistToggle() {
  const ids = useWishlist((s) => s.ids);
  const status = useAuth((s) => s.status);
  const qc = useQueryClient();

  const toggle = async (product: Pick<ProductCard, "id" | "name">) => {
    const store = useWishlist.getState();
    const saved = store.ids.includes(product.id);
    if (saved) store.remove(product.id);
    else store.add(product.id);
    toast(saved ? "Removed from wishlist" : "Saved to wishlist", { description: product.name });
    if (status !== "authenticated") return;
    try {
      if (saved) await api(`/wishlist/${product.id}`, { method: "DELETE" });
      else await api("/wishlist", { body: { productId: product.id } });
      void qc.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (err) {
      // Roll back so the heart reflects what the server has.
      if (saved) useWishlist.getState().add(product.id);
      else useWishlist.getState().remove(product.id);
      toast.error(errorMessage(err));
    }
  };

  return { isSaved: (id: string) => ids.includes(id), toggle };
}

export function useCompareToggle() {
  const items = useCompare((s) => s.items);
  return {
    isCompared: (id: string) => items.some((i) => i.id === id),
    toggle: (p: ProductCard) => {
      const result = useCompare.getState().toggle(p);
      if (result === "full") toast.error("You can compare up to 4 pieces", { description: "Remove one to add another." });
      else toast(result === "added" ? "Added to compare" : "Removed from compare", { description: p.name });
    },
  };
}
