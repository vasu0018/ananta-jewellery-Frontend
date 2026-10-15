import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";
import type { Category, Collection } from "@/lib/types";

/** Round category thumbnails — scrolls sideways on mobile. */
export function CategoryCircles({ categories }: { categories: Pick<Category, "id" | "name" | "slug" | "image">[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:justify-center-safe lg:gap-6 lg:px-0 xl:gap-8">
      {categories.map((c) => (
        <Link key={c.id} href={`/category/${c.slug}`} className="group flex w-[88px] shrink-0 flex-col items-center gap-3 sm:w-[110px]">
          <span className="relative size-[88px] overflow-hidden rounded-full bg-blush ring-1 ring-line transition group-hover:ring-2 group-hover:ring-rose sm:size-[110px]">
            <Img src={c.image} alt={c.name} fill sizes="110px" className="object-cover transition duration-500 group-hover:scale-110" />
          </span>
          <span className="text-center text-[13px] font-medium text-ink-soft group-hover:text-ink">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}

/** Image tiles with the collection name and description beneath. */
export function CollectionTiles({
  collections,
  columns = 4,
  aspect = "aspect-square",
  showDescription,
}: {
  collections: Collection[];
  columns?: 2 | 3 | 4;
  aspect?: string;
  showDescription?: boolean;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5", cols)}>
      {collections.map((c) => (
        <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
          <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] bg-cream", aspect)}>
            <Img src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <div className="pt-3 text-center">
            <p className="text-[16px] font-bold text-ink transition group-hover:text-rose-dark sm:text-[18px]">{c.name}</p>
            {showDescription && c.description && <p className="mx-auto mt-1 line-clamp-2 max-w-xs text-[13px] text-muted">{c.description}</p>}
            <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-rose">
              Explore <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Small pill-style links with a round thumbnail, e.g. "Gifts for Mom". */
export function BondCards({ collections }: { collections: Collection[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {collections.map((c) => (
        <Link key={c.id} href={`/collections/${c.slug}`} className="group flex items-center gap-3 rounded-full bg-white p-2 pr-5 shadow-soft transition hover:-translate-y-0.5">
          <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-blush">
            <Img src={c.image} alt="" fill sizes="56px" className="object-cover" />
          </span>
          <span className="text-[14px] font-medium text-ink">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
