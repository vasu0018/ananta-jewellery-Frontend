"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, MapPin, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useSettings } from "@/components/providers/SettingsProvider";
import { OrderCard } from "./OrderCard";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { useWishlist } from "@/stores/lists";
import type { Address, OrderSummary, Paged } from "@/lib/types";

export function AccountDashboard() {
  const customer = useAuth((s) => s.customer)!;
  const settings = useSettings();
  const wishlistCount = useWishlist((s) => s.ids.length);
  const orders = useQuery({ queryKey: ["account", "orders", 1, 3], queryFn: () => api<Paged<OrderSummary>>("/account/orders?page=1&limit=3") });
  const addresses = useQuery({ queryKey: ["account", "addresses"], queryFn: () => api<Address[]>("/account/addresses") });

  const points = customer.loyaltyPoints;
  const stats = [
    { href: "/account/orders", icon: Package, label: "Orders", value: orders.data?.meta.total },
    { href: "/wishlist", icon: Heart, label: "Wishlist", value: wishlistCount },
    { href: "/account/addresses", icon: MapPin, label: "Addresses", value: addresses.data?.length },
  ];

  return (
    <div className="space-y-8">
      {settings.loyalty.enabled && (
        <Link
          href="/account/loyalty"
          className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-blush via-white to-gold-soft/40 p-6 ring-1 ring-line transition hover:shadow-soft"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-white text-gold shadow-soft">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm text-ink-soft">Ananta points</p>
              <p className="text-2xl font-semibold tabular-nums text-ink">{points.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <p className="text-sm text-ink-soft">
            Worth <span className="font-semibold text-ink">{inr(points * settings.loyalty.pointValue)}</span> on your next order
            <ArrowRight className="ml-1 inline size-4" />
          </p>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ href, icon: Icon, label, value }) => (
          <Link key={href} href={href} className="rounded-2xl border border-line p-4 text-center transition hover:border-line-strong sm:p-5">
            <Icon className="mx-auto size-5 text-rose" />
            <p className="mt-2 text-2xl font-semibold text-ink">{value ?? "–"}</p>
            <p className="text-xs text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Recent orders</h2>
          {!!orders.data?.meta.total && (
            <Link href="/account/orders" className="text-sm font-medium text-rose-dark underline-offset-4 hover:underline">
              View all
            </Link>
          )}
        </div>
        {orders.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : orders.data?.items.length ? (
          <div className="space-y-3">
            {orders.data.items.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line">
            <EmptyState
              icon={<Package />}
              title="No orders yet"
              description="When you place an order, you'll be able to track it here."
              action={
                <Button asChild>
                  <Link href="/shop">Start shopping</Link>
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
