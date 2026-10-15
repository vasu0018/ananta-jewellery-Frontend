import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="bg-[#fdfbf8]">
      <div className="container-x py-8 sm:py-10">
        <h1 className="mb-6 font-display text-4xl text-ink">Checkout</h1>
        <CheckoutView />
      </div>
    </div>
  );
}
