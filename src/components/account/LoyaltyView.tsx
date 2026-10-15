"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, ShoppingBag, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/misc";
import { useSettings } from "@/components/providers/SettingsProvider";
import { AccountHeading } from "./AccountShell";
import { api } from "@/lib/api";
import { formatDate, inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth";
import type { LoyaltyEntry, LoyaltyLedger } from "@/lib/types";

const LABEL: Record<LoyaltyEntry["type"], string> = { EARN: "Earned", REDEEM: "Redeemed", ADJUST: "Adjustment", EXPIRE: "Expired" };

export function LoyaltyView() {
  const settings = useSettings();
  const { pointValue, earnPer100, signupBonus } = settings.loyalty;
  const ledger = useQuery({ queryKey: ["account", "loyalty"], queryFn: () => api<LoyaltyLedger>("/account/loyalty") });
  const balance = ledger.data?.balance;

  // Keep the cached customer (used by the header and checkout) in step with the live balance.
  useEffect(() => {
    const { customer, setCustomer } = useAuth.getState();
    if (customer && balance !== undefined && customer.loyaltyPoints !== balance) setCustomer({ ...customer, loyaltyPoints: balance });
  }, [balance]);

  const steps = [
    { icon: ShoppingBag, title: "Shop", text: `Earn ${earnPer100} ${earnPer100 === 1 ? "point" : "points"} for every ₹100 you spend, credited once your order is delivered.` },
    { icon: Sparkles, title: "Collect", text: signupBonus ? `New members get ${signupBonus} points just for joining.` : "Watch your balance grow with every delivered order." },
    { icon: Gift, title: "Redeem", text: `Each point is worth ${inr(pointValue)}. Apply them at checkout on your next order.` },
  ];

  return (
    <div className="space-y-8">
      <AccountHeading title="Ananta points" description="Our way of saying thank you for every sparkle you bring home." />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ink-soft to-[#3a2b2b] p-6 text-white sm:p-8">
        <Sparkles className="absolute -right-6 -top-6 size-40 text-white/5" aria-hidden />
        <p className="text-sm text-white/70">Available balance</p>
        {balance === undefined ? (
          <Skeleton className="mt-2 h-12 w-40 opacity-30" />
        ) : (
          <>
            <p className="mt-1 text-4xl font-semibold tabular-nums sm:text-5xl">{balance.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-gold-soft">Worth {inr(balance * pointValue)} on your next order</p>
          </>
        )}
      </div>

      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-line p-5">
            <Icon className="size-5 text-rose" />
            <p className="mt-3 font-medium text-ink">{title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <section>
        <h3 className="mb-3 font-display text-xl text-ink">History</h3>
        {ledger.isLoading ? (
          <Skeleton className="h-48" />
        ) : ledger.data?.ledger.length ? (
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-cream text-left text-xs uppercase tracking-[0.06em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ledger.data.ledger.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      <span className="text-ink">{LABEL[e.type]}</span>
                      {e.note && <span className="text-muted"> · {e.note}</span>}
                    </td>
                    <td className={cn("whitespace-nowrap px-4 py-3 text-right font-medium", e.points >= 0 ? "text-success" : "text-ink-soft")}>
                      {e.points >= 0 ? "+" : "−"}
                      {Math.abs(e.points).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
            No activity yet. Points you earn and redeem will show up here.
          </p>
        )}
      </section>
    </div>
  );
}
