"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/misc";
import { Img } from "@/components/ui/Img";
import { Field, FormError } from "@/components/forms/Field";
import { EventList, ProgressSteps, ShipmentCard, StatusPill } from "./OrderTimeline";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import { formatDateTime, inr } from "@/lib/format";
import type { TrackResult } from "@/lib/types";

type Lookup = { order: string; contact: string };

/** Guest order lookup by order number + email or phone. Prefilled (and run) from `?order=&contact=`. */
export function TrackOrder({ initial }: { initial: Lookup }) {
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Partial<Lookup>>({});
  const [lookup, setLookup] = useState<Lookup | null>(initial.order && initial.contact ? initial : null);

  useEffect(() => {
    if (initial.contact) router.replace(`${pathname}?order=${encodeURIComponent(initial.order)}`, { scroll: false });
  }, [initial.contact, initial.order, pathname, router]);

  const result = useQuery({
    queryKey: ["track", lookup?.order, lookup?.contact],
    queryFn: () => api<TrackResult>(`/checkout/track?order=${encodeURIComponent(lookup!.order)}&contact=${encodeURIComponent(lookup!.contact)}`),
    enabled: !!lookup,
    retry: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = form.order.trim().toUpperCase();
    const contact = form.contact.trim();
    const next: Partial<Lookup> = {};
    if (!order) next.order = "Enter your order number";
    if (!contact) next.contact = "Enter the email or mobile number used at checkout";
    setErrors(next);
    if (next.order || next.contact) return;
    setLookup({ order, contact });
    router.replace(`${pathname}?order=${encodeURIComponent(order)}`, { scroll: false });
  };

  const o = result.data;

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={submit} className="grid gap-4 rounded-3xl bg-cream p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-start sm:p-6" noValidate>
        <Field
          label="Order number"
          placeholder="e.g. AJ2610150202"
          value={form.order}
          onChange={(e) => {
            setForm({ ...form, order: e.target.value });
            setErrors({ ...errors, order: undefined });
          }}
          error={errors.order}
          autoCapitalize="characters"
        />
        <Field
          label="Email or mobile number"
          autoComplete="email"
          value={form.contact}
          onChange={(e) => {
            setForm({ ...form, contact: e.target.value });
            setErrors({ ...errors, contact: undefined });
          }}
          error={errors.contact}
        />
        <Button type="submit" className="sm:mt-[26px]" loading={result.isFetching}>
          <Search className="size-4" /> Track
        </Button>
      </form>

      <div className="mt-8" aria-live="polite">
        {result.isError && <FormError message={errorMessage(result.error)} />}
        {result.isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        )}
        {o && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Order</p>
                <p className="text-xl font-medium tracking-wide tabular-nums text-ink">{o.orderNumber}</p>
                <p className="mt-1 text-sm text-muted">Placed {formatDateTime(o.placedAt)}</p>
              </div>
              <div className="text-right">
                <StatusPill status={o.status} label={o.statusLabel} />
                <p className="mt-2 text-sm text-ink-soft">
                  {inr(o.total)} · {o.paymentMethod === "COD" ? "Cash on delivery" : o.paymentStatus === "PAID" ? "Paid online" : "Payment pending"}
                </p>
              </div>
            </div>

            <section className="rounded-2xl border border-line p-5 sm:p-6">
              <ProgressSteps status={o.status} statusLabel={o.statusLabel} />
              {o.shipments.length > 0 && (
                <div className="mt-6 space-y-3">
                  {o.shipments.map((s, i) => (
                    <ShipmentCard key={s.awb ?? i} shipment={s} />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-line p-5 sm:p-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Items</h2>
              <ul className="divide-y divide-line">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-4 py-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                      <Img src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="line-clamp-1 text-ink">{i.name}</p>
                      <p className="text-xs text-muted">
                        {i.variantTitle ? `${i.variantTitle} · ` : ""}Qty {i.quantity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {o.events.length > 0 && (
              <section className="rounded-2xl border border-line p-5 sm:p-6">
                <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.08em] text-ink-soft">Updates</h2>
                <EventList events={o.events} />
              </section>
            )}

            <p className="text-center text-sm text-muted">
              Have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(`/account/orders/${o.orderNumber}`)}`} className="font-medium text-rose-dark underline-offset-4 hover:underline">
                Sign in
              </Link>{" "}
              to cancel, return or download your invoice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
