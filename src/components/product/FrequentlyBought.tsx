"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { track } from "@/hooks/useShop";
import type { ProductCard } from "@/lib/types";

const pickVariant = (p: ProductCard) => p.variants.find((v) => v.stock > 0) ?? null;

/** "Complete the look": this product plus co-purchased pieces, added to the bag together. */
export function FrequentlyBought({ current, items }: { current: ProductCard; items: ProductCard[] }) {
  const all = [current, ...items.filter((i) => i.inStock)].slice(0, 3);
  const [selected, setSelected] = useState<string[]>(all.map((p) => p.id));
  const add = useCart((s) => s.add);
  const setCartOpen = useUi((s) => s.setCartOpen);
  if (all.length < 2) return null;

  const chosen = all.filter((p) => selected.includes(p.id));
  const total = chosen.reduce((s, p) => s + (pickVariant(p)?.price ?? p.price), 0);
  const mrp = chosen.reduce((s, p) => s + (pickVariant(p)?.compareAtPrice ?? p.compareAtPrice ?? p.price), 0);

  const addAll = () => {
    let added = 0;
    for (const p of chosen) {
      const v = pickVariant(p);
      if (v) {
        add(v.id, 1);
        added++;
      }
    }
    if (!added) {
      toast.error("These pieces are out of stock");
      return;
    }
    track("add_to_cart");
    setCartOpen(true);
  };

  return (
    <section className="mt-4 rounded-3xl bg-cream p-5 sm:p-8">
      <h2 className="font-display text-3xl text-ink">Frequently bought together</h2>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3 sm:gap-4">
          {all.map((p, i) => {
            const on = selected.includes(p.id);
            return (
              <div key={p.id} className="flex items-center gap-3 sm:gap-4">
                {i > 0 && <Plus className="size-5 shrink-0 text-muted" />}
                <div className="w-32 sm:w-40">
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                    <Link href={`/products/${p.slug}`}>
                      <Img src={p.image} alt={p.name} fill sizes="160px" className={cn("object-cover transition", !on && "opacity-40")} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(on ? selected.filter((x) => x !== p.id) : [...selected, p.id])}
                      className={cn("absolute left-2 top-2 grid size-6 place-items-center rounded-md border-2 transition", on ? "border-ink bg-ink text-white" : "border-line-strong bg-white")}
                      aria-label={on ? `Exclude ${p.name}` : `Include ${p.name}`}
                      aria-pressed={on}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink-soft">
                    {i === 0 && <span className="font-medium text-ink">This item: </span>}
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">{inr(pickVariant(p)?.price ?? p.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="shrink-0 rounded-2xl bg-white p-5 lg:w-64">
          <p className="text-sm text-muted">Total for {chosen.length} {chosen.length === 1 ? "item" : "items"}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {inr(total)}
            {mrp > total && <span className="ml-2 text-sm font-normal text-muted line-through">{inr(mrp)}</span>}
          </p>
          <Button block className="mt-4" disabled={!chosen.length} onClick={addAll}>
            Add {chosen.length > 1 ? `all ${chosen.length}` : ""} to bag
          </Button>
        </div>
      </div>
    </section>
  );
}
