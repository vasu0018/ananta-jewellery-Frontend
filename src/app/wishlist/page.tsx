import type { Metadata } from "next";
import { WishlistView } from "@/components/lists/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="mb-6 font-display text-4xl text-ink sm:text-5xl">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
