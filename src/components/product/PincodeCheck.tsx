"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Truck, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { inr } from "@/lib/format";
import { savePincode, usePincode } from "@/hooks/usePincode";

type Result = {
  serviceable: boolean;
  codAvailable?: boolean;
  minDays?: number;
  maxDays?: number;
  shippingFee?: number;
  message: string;
};

const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** "Estimated Delivery Time" card; the pincode is shared with the header pill and remembered. */
export function PincodeCheck({ variantId }: { variantId: string | null }) {
  const pincode = usePincode();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useQuery({
    queryKey: ["pincode", pincode, variantId],
    queryFn: async () => {
      const r = await api<Result>(`/content/pincode/${pincode}${variantId ? `?variantId=${variantId}` : ""}`);
      const eta = r.serviceable && r.maxDays ? dayFmt.format(new Date(Date.now() + r.maxDays * 86_400_000)) : null;
      return { ...r, eta };
    },
    enabled: /^\d{6}$/.test(pincode),
    staleTime: 600_000,
    retry: false,
  });
  const result = check.data;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pin = String(new FormData(e.currentTarget).get("pincode") ?? "");
    if (!/^\d{6}$/.test(pin)) return setError("Enter a valid 6-digit pincode");
    setError(null);
    setEditing(false);
    savePincode(pin);
  };

  const showForm = editing || !pincode;
  const eta = result?.eta;

  return (
    <div className="rounded-[10px] border border-line p-4">
      <p className="mb-3 text-[16px] font-bold text-ink">Estimated Delivery Time</p>
      {showForm ? (
        <form onSubmit={submit} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              name="pincode"
              defaultValue={pincode}
              autoFocus={editing}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 6);
              }}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="Enter 6 digit pincode"
              aria-label="Pincode"
              className="h-11 w-full rounded-[6px] border border-line-strong pl-9 pr-3 text-[14px] outline-none focus:border-ink"
            />
          </div>
          <button type="submit" className="h-11 rounded-[6px] bg-rose px-5 text-[14px] font-bold text-white hover:bg-[#de5f7b]">
            Check
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-[6px] bg-cream px-3 py-2.5">
          <p className="flex items-center gap-2 text-[14px] text-ink">
            <MapPin className="size-4 text-rose" /> Deliver to <span className="font-bold">{pincode}</span>
          </p>
          <button type="button" onClick={() => setEditing(true)} className="text-[14px] font-bold text-rose hover:underline">
            Change
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {!showForm && check.isFetching && <p className="mt-3 text-[13px] text-muted">Checking delivery…</p>}
      {!showForm && check.error && <p className="mt-3 text-[13px] text-danger">{errorMessage(check.error)}</p>}
      {!showForm && result && (
        <div className="mt-3 space-y-1.5 text-[13.5px]">
          {eta ? (
            <p className="flex items-center gap-2 text-ink">
              <Truck className="size-4 text-rose" /> Delivery by <span className="font-bold">{eta}</span>
            </p>
          ) : (
            <p className={`flex items-center gap-2 ${result.serviceable ? "text-success" : "text-danger"}`}>
              {result.serviceable ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              <span className="font-bold">{result.message}</span>
            </p>
          )}
          {result.serviceable && (
            <p className="pl-6 text-[#121212a6]">
              {result.shippingFee ? `Shipping ${inr(result.shippingFee)}` : "Free shipping"} · {result.codAvailable ? "Cash on delivery available" : "Prepaid orders only"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
