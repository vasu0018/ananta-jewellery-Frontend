"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Check, GitCompareArrows, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, Price, Skeleton, Stars } from "@/components/ui/misc";
import { Img } from "@/components/ui/Img";
import { useAddToCart } from "@/hooks/useShop";
import { api } from "@/lib/api";
import { titleCase } from "@/lib/utils";
import { useCompare, useCompareHydrated } from "@/stores/lists";
import { useUi } from "@/stores/ui";
import type { ProductDetail } from "@/lib/types";

type Row = { label: string; value: (p: ProductDetail) => React.ReactNode };

/** Keep admin-entered casing ("14K", "IGI"); only tidy all-lowercase values. */
const tidy = (v: string) => (v === v.toLowerCase() ? titleCase(v) : v);
const text = (v: string | null | undefined) => (v ? tidy(v) : <Minus className="mx-auto size-4 text-line-strong" aria-label="Not specified" />);
const yesNo = (v: boolean) => (v ? <Check className="mx-auto size-4 text-success" aria-label="Yes" /> : <X className="mx-auto size-4 text-line-strong" aria-label="No" />);

const ROWS: Row[] = [
  {
    label: "Rating",
    value: (p) =>
      p.ratingCount ? (
        <span className="inline-flex items-center gap-1.5">
          <Stars value={p.ratingAvg} size={13} /> <span className="text-xs text-muted">({p.ratingCount})</span>
        </span>
      ) : (
        <span className="text-xs text-muted">No reviews yet</span>
      ),
  },
  { label: "Category", value: (p) => text(p.category?.name) },
  { label: "Material", value: (p) => text(p.material) },
  { label: "Colour", value: (p) => text(p.colour) },
  { label: "Stone", value: (p) => text(p.stone) },
  {
    label: "Sizes",
    value: (p) => {
      const sizes = p.variants.map((v) => v.size).filter(Boolean);
      return sizes.length ? sizes.join(", ") : "One size";
    },
  },
  { label: "Weight", value: (p) => (p.weight ? `${p.weight} g` : text(null)) },
  { label: "Occasion", value: (p) => (p.occasions.length ? p.occasions.map(tidy).join(", ") : text(null)) },
  { label: "Certificate", value: (p) => yesNo(p.hasCertificate) },
  { label: "Warranty", value: (p) => text(p.warranty) },
  {
    label: "Availability",
    value: (p) => (p.inStock ? <span className="text-success">In stock</span> : <span className="text-muted">Sold out</span>),
  },
];

/** Side-by-side comparison of up to four pieces, using fresh product details. */
export function CompareView() {
  const hydrated = useCompareHydrated();
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const addToCart = useAddToCart();
  const setQuickView = useUi((s) => s.setQuickView);

  const details = useQueries({
    queries: items.map((i) => ({
      queryKey: ["product", i.slug],
      queryFn: () => api<ProductDetail>(`/catalog/products/${encodeURIComponent(i.slug)}`),
      staleTime: 60_000,
    })),
  });

  if (!hydrated) return <Skeleton className="h-96" />;

  if (!items.length) {
    return (
      <EmptyState
        icon={<GitCompareArrows />}
        title="Nothing to compare yet"
        description="Tap the compare icon on up to four pieces to see them side by side."
        action={
          <Button asChild>
            <Link href="/shop">Browse jewellery</Link>
          </Button>
        }
      />
    );
  }

  const products = details.map((d) => d.data);

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <table
          className="min-w-[640px] table-fixed border-separate border-spacing-0 text-sm"
          style={{ width: `min(100%, ${160 + items.length * 280}px)` }}
        >
          <colgroup>
            <col className="w-32 sm:w-40" />
            {items.map((i) => (
              <col key={i.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="px-3 pb-5 text-left align-bottom font-normal">
                <span className="sr-only">Product</span>
                <p className="text-xs text-muted">
                  {items.length} of 4 pieces
                </p>
                <button type="button" onClick={clear} className="mt-1 text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
                  Clear all
                </button>
              </th>
              {items.map((item, idx) => {
                const p = products[idx];
                const needsChoice = (p?.variants.length ?? item.variants.length) > 1;
                return (
                  <th key={item.id} scope="col" className="px-2 pb-5 text-left align-top font-normal sm:px-3">
                    <div className="relative">
                      <Link href={`/products/${item.slug}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-cream">
                        <Img src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 22vw, 40vw" className="object-cover" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <Link href={`/products/${item.slug}`} className="mt-3 line-clamp-2 block text-[14px] leading-snug text-ink hover:text-rose-dark">
                      {item.name}
                    </Link>
                    <Price
                      price={p?.price ?? item.price}
                      compareAtPrice={p?.compareAtPrice ?? item.compareAtPrice}
                      discountPct={p?.discountPct ?? item.discountPct}
                      size="sm"
                      className="mt-1"
                    />
                    <Button
                      size="sm"
                      block
                      className="mt-3"
                      disabled={p ? !p.inStock : !item.inStock}
                      onClick={() => (needsChoice ? setQuickView(item.slug) : addToCart(p?.variants[0]?.id ?? item.defaultVariantId))}
                    >
                      {needsChoice ? "Choose size" : "Add to bag"}
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, r) => (
              <tr key={row.label} className={r % 2 === 0 ? "bg-cream/60" : undefined}>
                <th scope="row" className="rounded-l-xl px-3 py-3 text-left text-xs font-medium uppercase tracking-[0.06em] text-ink-soft">
                  {row.label}
                </th>
                {products.map((p, idx) => (
                  <td key={items[idx].id} className="px-3 py-3 text-center text-ink-soft last:rounded-r-xl">
                    {p ? row.value(p) : <Skeleton className="mx-auto h-4 w-16" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
