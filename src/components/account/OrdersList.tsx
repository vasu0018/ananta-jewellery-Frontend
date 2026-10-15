"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { FormError } from "@/components/forms/Field";
import { Pagination } from "@/components/listing/Pagination";
import { AccountHeading } from "./AccountShell";
import { OrderCard } from "./OrderCard";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-error";
import type { OrderSummary, Paged } from "@/lib/types";

const PER_PAGE = 10;

export function OrdersList({ page }: { page: number }) {
  const orders = useQuery({
    queryKey: ["account", "orders", page, PER_PAGE],
    queryFn: () => api<Paged<OrderSummary>>(`/account/orders?page=${page}&limit=${PER_PAGE}`),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <AccountHeading title="Orders" description="Track deliveries, download invoices and request returns." />
      {orders.isError && <FormError message={errorMessage(orders.error)} />}
      {orders.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : orders.data?.items.length ? (
        <>
          <div className="space-y-3" aria-busy={orders.isFetching}>
            {orders.data.items.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination page={page} totalPages={orders.data.meta.pages} />
          </div>
        </>
      ) : (
        orders.data && (
          <div className="rounded-2xl border border-dashed border-line">
            <EmptyState
              icon={<Package />}
              title="No orders yet"
              description="Your orders will appear here once you've placed one."
              action={
                <Button asChild>
                  <Link href="/shop">Explore jewellery</Link>
                </Button>
              }
            />
          </div>
        )
      )}
    </div>
  );
}
