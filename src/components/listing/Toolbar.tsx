"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PointerSelect } from "@/components/ui/PointerSelect";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterPanel, PRICE_BANDS, useFilterGroups } from "./FilterPanel";
import { useListing } from "./ListingProvider";
import { LIST_KEYS, SORT_OPTIONS } from "@/lib/listing";
import { SWATCH } from "@/lib/swatch";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Facets } from "@/lib/types";

function SortSelect({ id, className }: { id: string; className?: string }) {
  const { params, set } = useListing();
  const sort = params.get("sort") ?? "featured";
  return (
    <label htmlFor={id} className={cn("relative flex items-center gap-1 text-[15px] text-ink", className)}>
      <span className="whitespace-nowrap text-[#121212a6]">Sort by:</span>
      <PointerSelect
        id={id}
        value={sort}
        onChange={(e) => set({ sort: e.target.value === "featured" ? null : e.target.value })}
        className="cursor-pointer bg-transparent pr-6 font-bold outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </PointerSelect>
      <ChevronDown className="pointer-events-none absolute right-0 size-4" />
    </label>
  );
}

/** Price chips, colour circles, the horizontal filter dropdown bar, sort, result count and active-filter chips. */
export function Toolbar({ total, facets, hide = [], title }: { total: number; facets: Facets; hide?: string[]; title?: string }) {
  const { params, set, toggle, values, clearAll, pending } = useListing();
  const groups = useFilterGroups(facets, hide);
  const [sheet, setSheet] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const close = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openId]);

  const categoryName = (slug: string) => facets.categories.find((c) => c.slug === slug)?.name ?? slug;
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const k of LIST_KEYS) {
    if (hide.includes(k)) continue;
    for (const v of values(k)) chips.push({ key: `${k}:${v}`, label: k === "category" ? categoryName(v) : v, onRemove: () => toggle(k, v) });
  }
  const min = params.get("minPrice") ?? "";
  const max = params.get("maxPrice") ?? "";
  if (min || max) {
    chips.push({
      key: "price",
      label: min && max ? `${inr(Number(min))} – ${inr(Number(max))}` : min ? `Above ${inr(Number(min))}` : `Under ${inr(Number(max))}`,
      onRemove: () => set({ minPrice: null, maxPrice: null }),
    });
  }
  if (params.get("rating")) chips.push({ key: "rating", label: `${params.get("rating")}★ & above`, onRemove: () => set({ rating: null }) });
  if (params.get("inStock")) chips.push({ key: "stock", label: "In stock", onRemove: () => set({ inStock: null }) });

  const keep = ["q", "sort", "store", ...hide, "bestseller", "newArrival", "gift", "flashSale"];
  const colours = values("colour");

  return (
    <div className="mb-6 space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {PRICE_BANDS.map((b) => {
          const active = min === b.min && max === b.max;
          return (
            <button
              key={b.label}
              type="button"
              onClick={() => set(active ? { minPrice: null, maxPrice: null } : { minPrice: b.min || null, maxPrice: b.max || null })}
              className={cn(
                "h-8 shrink-0 whitespace-nowrap rounded-[4px] border px-3 text-[13px] tracking-[0.3px] transition",
                active ? "border-rose bg-blush font-bold text-ink" : "border-[#d5d5d5] bg-white text-ink hover:border-ink",
              )}
              aria-pressed={active}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {!hide.includes("colour") && facets.colours.length > 1 && (
        <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {facets.colours.map((c) => {
            const active = colours.includes(c.value);
            return (
              <button key={c.value} type="button" onClick={() => toggle("colour", c.value)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5" aria-pressed={active}>
                <span
                  className={cn("size-14 rounded-full border-[3px] transition", active ? "border-rose" : "border-white shadow-[0_0_0_1px_var(--color-line-strong)]")}
                  style={{ background: SWATCH[c.value] ?? "#e8e2da" }}
                />
                <span className={cn("text-[13px]", active ? "font-bold text-ink" : "text-[#121212bf]")}>{c.value}</span>
              </button>
            );
          })}
        </div>
      )}

      <div ref={barRef} className="hidden items-center justify-between gap-4 border-b border-line pb-2 lg:flex">
        <div className="-ml-2 flex flex-wrap items-center">
          {groups.map((g) => {
            const open = openId === g.id;
            return (
              <div key={g.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : g.id)}
                  aria-expanded={open}
                  className={cn(
                    "flex h-9 cursor-pointer items-center gap-1 rounded-[6px] px-2.5 text-[15px] tracking-[0.3px] transition-colors hover:bg-[#ffe8ee]",
                    open || g.count ? "text-ink" : "text-[#121212bf] hover:text-ink",
                  )}
                >
                  {g.title}
                  {g.count > 0 && <span className="grid size-[18px] place-items-center rounded-full bg-rose text-[10px] font-bold text-white">{g.count}</span>}
                  <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-30 max-h-[380px] w-[290px] animate-fade-in overflow-y-auto rounded-[8px] border border-line bg-white p-4 shadow-lift">
                    {g.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <SortSelect id="sort-desktop" />
      </div>

      <div className="grid grid-cols-2 divide-x divide-line rounded-[6px] border border-line lg:hidden">
        <button type="button" onClick={() => setSheet(true)} className="flex h-11 items-center justify-center gap-2 text-[15px] font-bold text-ink">
          <SlidersHorizontal className="size-4" /> Filter{chips.length ? ` (${chips.length})` : ""}
        </button>
        <SortSelect id="sort-mobile" className="justify-center px-2 text-[14px]" />
      </div>

      <h2 className="text-[20px] text-ink sm:text-[22px]">
        {title ?? "Showing"} <span className="text-[#121212a6]">({total} {total === 1 ? "Design" : "Designs"})</span>
      </h2>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.onRemove} className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1.5 text-[13px] text-ink transition hover:bg-[#ffd0da]">
              {c.label} <X className="size-3.5" />
            </button>
          ))}
          <button type="button" onClick={() => clearAll(keep)} className="px-2 text-[13px] font-bold text-rose underline underline-offset-4">
            Clear all
          </button>
        </div>
      )}

      <Sheet
        open={sheet}
        onOpenChange={setSheet}
        side="bottom"
        title="Filters"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => clearAll(keep)} disabled={!chips.length}>
              Clear all
            </Button>
            <Button onClick={() => setSheet(false)} loading={pending}>
              Show {total} results
            </Button>
          </div>
        }
      >
        <FilterPanel facets={facets} hide={hide} />
      </Sheet>
    </div>
  );
}
