"use client";

import { createContext, useContext, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LIST_SEP } from "@/lib/listing";

type ListingCtx = {
  pending: boolean;
  params: URLSearchParams;
  /** Set/clear URL params (null clears). Resets to page 1 unless `page` is given. */
  set: (updates: Record<string, string | null>) => void;
  /** Add/remove one value of a multi-select param. */
  toggle: (key: string, value: string) => void;
  values: (key: string) => string[];
  clearAll: (keep?: string[]) => void;
};

const Ctx = createContext<ListingCtx | null>(null);

/** Filter state lives in the URL so listings are shareable, crawlable and server-rendered. */
export function ListingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const values = (key: string) => (params.get(key) ?? "").split(LIST_SEP).filter(Boolean);

  const set: ListingCtx["set"] = (updates) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in updates)) next.delete("page");
    push(next);
  };

  const toggle: ListingCtx["toggle"] = (key, value) => {
    const current = values(key);
    const list = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set({ [key]: list.length ? list.join(LIST_SEP) : null });
  };

  const clearAll = (keep: string[] = ["q", "sort"]) => {
    const next = new URLSearchParams();
    for (const k of keep) {
      const v = params.get(k);
      if (v) next.set(k, v);
    }
    push(next);
  };

  return <Ctx.Provider value={{ pending, params, set, toggle, values, clearAll }}>{children}</Ctx.Provider>;
}

export function useListing() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useListing must be used inside <ListingProvider>");
  return ctx;
}

/** Dims the server-rendered results while a filter change is loading. */
export function ListingResults({ children }: { children: React.ReactNode }) {
  const { pending } = useListing();
  return (
    <div className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-50")} aria-busy={pending}>
      {children}
    </div>
  );
}
