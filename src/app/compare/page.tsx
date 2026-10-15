import type { Metadata } from "next";
import { CompareView } from "@/components/lists/CompareView";

export const metadata: Metadata = {
  title: "Compare jewellery",
  robots: { index: false },
};

export default function ComparePage() {
  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="mb-2 font-display text-4xl text-ink sm:text-5xl">Compare</h1>
      <p className="mb-6 text-[15px] text-muted">See materials, sizes and prices side by side.</p>
      <CompareView />
    </div>
  );
}
