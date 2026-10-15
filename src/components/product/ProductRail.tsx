"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { ProductCard as Product } from "@/lib/types";

/** Horizontally scrolling product row with arrow controls on desktop. */
export function ProductRail({ products, className }: { products: Product[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  if (!products.length) return null;
  return (
    <div className={cn("relative", className)}>
      <div ref={ref} onScroll={update} className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-6 lg:px-0">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 2} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-18px)]" />
        ))}
      </div>
      {products.length > 4 && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            className="absolute -left-5 top-[38%] hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-soft transition hover:bg-cream disabled:opacity-0 lg:grid"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            className="absolute -right-5 top-[38%] hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-soft transition hover:bg-cream disabled:opacity-0 lg:grid"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}

/** Tabbed rails, e.g. Bestsellers / New arrivals. */
export function ProductTabs({ tabs }: { tabs: { label: string; products: Product[] }[] }) {
  const visible = tabs.filter((t) => t.products.length);
  const [active, setActive] = useState(0);
  if (!visible.length) return null;
  return (
    <div>
      <div className="mb-8 flex justify-center gap-2" role="tablist">
        {visible.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-5 py-2 text-[13px] font-medium uppercase tracking-[0.1em] transition",
              i === active ? "bg-ink text-white" : "bg-cream text-ink-soft hover:bg-line",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ProductRail key={active} products={visible[active].products} />
    </div>
  );
}
