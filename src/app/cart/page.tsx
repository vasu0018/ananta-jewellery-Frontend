import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="mb-8 font-display text-4xl text-ink sm:text-5xl">Your bag</h1>
      <CartView />
    </div>
  );
}
