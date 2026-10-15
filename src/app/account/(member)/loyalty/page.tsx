import type { Metadata } from "next";
import { LoyaltyView } from "@/components/account/LoyaltyView";

export const metadata: Metadata = { title: "Ananta points" };

export default function LoyaltyPage() {
  return <LoyaltyView />;
}
