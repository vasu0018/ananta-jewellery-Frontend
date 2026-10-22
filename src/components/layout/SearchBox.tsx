"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search, TrendingUp, X } from "lucide-react";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Img } from "@/components/ui/Img";
import { Skeleton } from "@/components/ui/misc";
import type { SearchSuggest } from "@/lib/types";

const HINTS = ["Rings", "Earrings", "Necklaces", "Pendants", "Bracelets", "Anklets", "Gifts for her", "Mangalsutra"];

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/**
 * Search input with live suggestions (products, categories, collections, trending terms).
 * `variant="inline"` is the desktop header field; `"panel"` fills the mobile search sheet.
 */
export function SearchBox({ variant = "inline", autoFocus, onNavigate }: { variant?: "inline" | "panel"; autoFocus?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(variant === "panel");
  const term = useDebounced(q.trim(), 220);

  const { data, isFetching } = useQuery({
    queryKey: ["suggest", term.length < 2 ? "" : term],
    queryFn: ({ signal }) => api<SearchSuggest>(`/catalog/search/suggest?q=${encodeURIComponent(term)}`, { signal }),
    enabled: open,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (variant !== "inline") return;
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [variant]);

  const go = (href: string) => {
    setOpen(variant === "panel");
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (value) go(`/search?q=${encodeURIComponent(value)}`);
  };

  const [hint, setHint] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHint((i) => (i + 1) % HINTS.length), 2500);
    return () => clearInterval(t);
  }, []);

  const showPanel = open && (variant === "panel" || !!data || isFetching);
  const typing = term.length >= 2;
  const empty = typing && data && !data.products.length && !data.categories.length && !data.collections.length;

  return (
    <div ref={wrapRef} className={cn("relative", variant === "inline" ? "w-full max-w-[720px]" : "w-full")}>
      <form onSubmit={submit} role="search">
        <label htmlFor={`${listId}-q`} className="sr-only">
          Search jewellery
        </label>
        <div className="relative">
          <input
            id={`${listId}-q`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            autoFocus={autoFocus}
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              "h-[45px] w-full rounded-[4px] border border-[#c9c9c9] bg-white pl-4 pr-20 text-[15px] text-ink outline-none transition focus:border-ink/60",
              variant === "panel" && "h-12 text-base",
            )}
            aria-controls={`${listId}-list`}
          />
          {!q && (
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center overflow-hidden text-[15px] text-[#8a8a8a]" aria-hidden>
              Search&nbsp;
              <span key={hint} className="animate-slide-up">
                &ldquo;{HINTS[hint]}&rdquo;
              </span>
            </span>
          )}
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-11 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-line"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
          <button type="submit" className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-ink" aria-label="Search">
            <Search className="size-[20px]" />
          </button>
        </div>
      </form>

      {showPanel && (
        <div
          id={`${listId}-list`}
          className={cn(
            variant === "inline"
              ? "absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-lift"
              : "mt-5",
          )}
        >
          {!data && isFetching ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : empty ? (
            <p className="py-6 text-center text-sm text-muted">
              No matches for “{term}”. Try “silver ring” or “jhumka”.
            </p>
          ) : data ? (
            <div className="space-y-5">
              {!typing && data.popular.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {data.popular.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => go(`/search?q=${encodeURIComponent(p)}`)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition hover:border-ink hover:text-ink"
                      >
                        <TrendingUp className="size-3.5 text-gold" />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(data.categories.length > 0 || data.collections.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {data.categories.map((c) => (
                    <Link
                      key={`c-${c.slug}`}
                      href={`/category/${c.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1.5 text-[13px] text-ink hover:bg-[#f3e2df]"
                    >
                      {c.name} <ArrowUpRight className="size-3.5" />
                    </Link>
                  ))}
                  {data.collections.map((c) => (
                    <Link
                      key={`k-${c.slug}`}
                      href={`/collections/${c.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-gold-soft/60 px-3 py-1.5 text-[13px] text-ink hover:bg-gold-soft"
                    >
                      {c.name} <ArrowUpRight className="size-3.5" />
                    </Link>
                  ))}
                </div>
              )}

              {data.products.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{typing ? "Products" : "Trending now"}</p>
                  <ul className="divide-y divide-line/70">
                    {data.products.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => {
                            setOpen(variant === "panel");
                            onNavigate?.();
                          }}
                          className="-mx-2 flex items-center gap-3 rounded-[8px] px-2 py-2.5 transition-colors hover:bg-[#ffe8ee]"
                        >
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                            <Img src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-ink">{p.name}</p>
                            <p className="mt-0.5 text-[13px] font-medium text-ink">
                              {inr(p.price)}
                              {p.compareAtPrice && p.compareAtPrice > p.price && (
                                <span className="ml-2 font-normal text-muted line-through">{inr(p.compareAtPrice)}</span>
                              )}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {typing && (
                    <button
                      type="button"
                      onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                      className="mt-2 w-full rounded-full bg-cream py-2.5 text-[13px] font-medium text-ink hover:bg-line"
                    >
                      See all results for “{term}”
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
