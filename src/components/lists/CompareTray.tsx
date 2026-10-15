"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { MAX_COMPARE } from "@/lib/config";
import { useCompare, useCompareHydrated } from "@/stores/lists";

const HIDDEN_ON = ["/compare", "/checkout", "/cart"];

/** Floating tray listing pieces picked for comparison. */
export function CompareTray() {
  const pathname = usePathname();
  const hydrated = useCompareHydrated();
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);

  if (!hydrated || !items.length || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 max-lg:[body:has([data-sticky-cta])_&]:bottom-24 flex justify-center px-4 pr-20 sm:pr-4" role="region" aria-label="Compare">
      <div className="flex animate-slide-up items-center gap-3 rounded-full bg-white py-2 pl-2 pr-2 shadow-lift ring-1 ring-line">
        <ul className="flex -space-x-2">
          {items.map((p) => (
            <li key={p.id} className="group relative">
              <div className="relative size-10 overflow-hidden rounded-full border-2 border-white bg-cream">
                <Img src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="absolute -right-1 -top-1 hidden size-4 place-items-center rounded-full bg-ink text-white group-hover:grid"
                aria-label={`Remove ${p.name} from compare`}
              >
                <X className="size-2.5" />
              </button>
            </li>
          ))}
        </ul>
        <span className="hidden text-[13px] text-ink-soft sm:inline">
          {items.length}/{MAX_COMPARE} selected
        </span>
        <button type="button" onClick={clear} className="text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
          Clear
        </button>
        <Link
          href="/compare"
          aria-disabled={items.length < 2}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition hover:bg-ink-soft aria-disabled:pointer-events-none aria-disabled:bg-muted"
        >
          <GitCompareArrows className="size-4" /> Compare
        </Link>
      </div>
    </div>
  );
}
