"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { savePincode, usePincode } from "@/hooks/usePincode";
import { cn } from "@/lib/utils";

/** "Where to Deliver?" pill next to the search; the pincode is reused by the product page delivery check. */
export function DeliverPill({ className }: { className?: string }) {
  const pincode = usePincode();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pin = String(new FormData(e.currentTarget).get("pincode") ?? "");
    if (!/^\d{6}$/.test(pin)) return setError("Enter a valid 6-digit pincode");
    savePincode(pin);
    setError(null);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-[49px] items-center gap-1.5 rounded-[5px] border border-[#fdcdd5] bg-[#fffeff] p-2 text-left text-black transition hover:border-rose"
      >
        <MapPin className="size-[18px] shrink-0 fill-[#fde3e8] text-rose" strokeWidth={1.6} />
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold">Where to Deliver?</span>
          <span className="flex items-center gap-0.5 whitespace-nowrap text-[11px]">
            {pincode ? `Deliver to ${pincode}` : "Update Delivery Pincode"}
            <ChevronDown className="size-3" />
          </span>
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 animate-fade-in rounded-[8px] border border-line bg-white p-4 shadow-lift">
          <p className="text-[15px] font-bold text-ink">Your Delivery Pincode</p>
          <p className="mt-0.5 text-[12.5px] text-muted">Enter your pincode to check availability and faster delivery options.</p>
          <form onSubmit={submit} className="mt-3 flex gap-2">
            <input
              name="pincode"
              defaultValue={pincode}
              autoFocus
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
              }}
              placeholder="Enter pincode"
              aria-label="Pincode"
              className="h-10 min-w-0 flex-1 rounded-[6px] border border-line-strong px-3 text-[14px] outline-none focus:border-ink"
            />
            <button type="submit" className="h-10 rounded-[6px] bg-rose px-4 text-[14px] font-bold text-white hover:bg-[#de5f7b]">
              Submit
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
