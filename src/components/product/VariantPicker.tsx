"use client";

import { cn } from "@/lib/utils";
import type { CardVariant } from "@/lib/types";

const unique = (vals: (string | null)[]) => [...new Set(vals.filter((v): v is string => !!v))];

/** Size / colour chips. Resolves the chosen combination to a variant; sold-out options are struck through. */
export function VariantPicker({
  variants,
  value,
  onChange,
  sizeLabel = "Size",
  onSizeGuide,
}: {
  variants: CardVariant[];
  value: string | null;
  onChange: (variantId: string) => void;
  sizeLabel?: string;
  onSizeGuide?: () => void;
}) {
  if (variants.length <= 1) return null;
  const selected = variants.find((v) => v.id === value) ?? null;
  const sizes = unique(variants.map((v) => v.size));
  const colours = unique(variants.map((v) => v.colour));
  const useTitles = !sizes.length && !colours.length;

  const pick = (dim: "size" | "colour", option: string) => {
    const other = dim === "size" ? selected?.colour : selected?.size;
    const otherKey = dim === "size" ? "colour" : "size";
    const match =
      variants.find((v) => v[dim] === option && (!other || v[otherKey] === other) && v.stock > 0) ??
      variants.find((v) => v[dim] === option && (!other || v[otherKey] === other)) ??
      variants.find((v) => v[dim] === option);
    if (match) onChange(match.id);
  };

  const chip = (active: boolean, soldOut: boolean) =>
    cn(
      "relative min-w-12 rounded-[6px] border px-4 py-2 text-[14px] transition",
      active ? "border-rose bg-blush font-bold text-ink" : "border-line-strong text-ink hover:border-ink",
      soldOut && !active && "text-muted line-through decoration-muted/60",
    );

  const group = (dim: "size" | "colour", label: string, options: string[]) => (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[16px] font-bold text-ink">
          Choose Your {label}: <span className="font-normal text-[#121212bf]">{selected?.[dim] ?? "Select"}</span>
        </p>
        {dim === "size" && onSizeGuide && (
          <button type="button" onClick={onSizeGuide} className="text-[13px] font-bold text-rose underline underline-offset-4">
            Size guide
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const soldOut = !variants.some((v) => v[dim] === o && v.stock > 0);
          const active = selected?.[dim] === o;
          return (
            <button key={o} type="button" role="radio" aria-checked={active} onClick={() => pick(dim, o)} className={chip(active, soldOut)} title={soldOut ? "Sold out" : undefined}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (useTitles) {
    return (
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Options">
        {variants.map((v) => (
          <button key={v.id} type="button" role="radio" aria-checked={v.id === value} onClick={() => onChange(v.id)} className={chip(v.id === value, v.stock <= 0)}>
            {v.title}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && group("size", sizeLabel, sizes)}
      {colours.length > 1 && group("colour", "Colour", colours)}
    </div>
  );
}

/** "Ring size" / "Chain length" / "Bangle size" depending on what the options look like. */
export function sizeLabelFor(variants: CardVariant[], categorySlug?: string | null) {
  if (variants.some((v) => v.size?.includes('"'))) return "Chain length";
  if (categorySlug?.includes("bangle") || categorySlug?.includes("bracelet")) return "Bangle size";
  if (categorySlug?.includes("ring")) return "Ring size";
  return "Size";
}
