"use client";

import { Truck } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { inr } from "@/lib/format";

export function FreeShippingMeter({ subtotal, freeShipping }: { subtotal: number; freeShipping?: boolean }) {
  const { checkout } = useSettings();
  const target = checkout.freeShippingAbove;
  if (!target) return null;
  const done = freeShipping || subtotal >= target;
  const pct = Math.min(100, Math.round((subtotal / target) * 100));
  return (
    <div className="rounded-2xl bg-cream px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] text-ink-soft">
        <Truck className="size-4 text-gold" />
        {done ? (
          <span>
            Yay! You&apos;ve unlocked <strong className="font-semibold text-ink">free shipping</strong>
          </span>
        ) : (
          <span>
            Add <strong className="font-semibold text-ink">{inr(target - subtotal)}</strong> more for free shipping
          </span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-rose transition-all duration-500" style={{ width: `${done ? 100 : pct}%` }} />
      </div>
    </div>
  );
}
