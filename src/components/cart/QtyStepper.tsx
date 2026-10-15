"use client";

import { Minus, Plus } from "lucide-react";
import { MAX_QTY } from "@/lib/config";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  max = MAX_QTY,
  size = "sm",
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const limit = Math.max(1, Math.min(MAX_QTY, max));
  const btn = cn("grid place-items-center text-ink transition hover:bg-cream disabled:opacity-30", size === "sm" ? "size-8" : "size-11");
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line-strong", className)}>
      <button type="button" className={cn(btn, "rounded-l-full")} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-3.5" />
      </button>
      <span className={cn("text-center font-medium tabular-nums", size === "sm" ? "w-7 text-sm" : "w-9")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={cn(btn, "rounded-r-full")} onClick={() => onChange(value + 1)} disabled={value >= limit} aria-label="Increase quantity">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
