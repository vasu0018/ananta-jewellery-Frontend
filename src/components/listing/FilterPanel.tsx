"use client";

import { useState } from "react";
import { Check, ChevronDown, Star } from "lucide-react";
import { useListing } from "./ListingProvider";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SWATCH } from "@/lib/swatch";
import type { Facet, Facets } from "@/lib/types";

export const PRICE_BANDS = [
  { label: "Under ₹999", min: "", max: "999" },
  { label: "₹1,000 – ₹1,999", min: "1000", max: "1999" },
  { label: "₹2,000 – ₹4,999", min: "2000", max: "4999" },
  { label: "₹5,000 – ₹9,999", min: "5000", max: "9999" },
  { label: "₹10,000 & above", min: "10000", max: "" },
];

function Group({ title, children, defaultOpen = true, count }: { title: string; children: React.ReactNode; defaultOpen?: boolean; count?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-[15px] font-bold text-ink">
          {title}
          {!!count && <span className="ml-2 rounded-full bg-rose px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
        </span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
}

function CheckRow({ label, count, checked, onChange }: { label: React.ReactNode; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-[14px] text-ink-soft hover:text-ink">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-[4px] border transition peer-focus-visible:ring-2 peer-focus-visible:ring-rose",
          checked ? "border-rose bg-rose text-white" : "border-line-strong bg-white",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted">{count}</span>}
    </label>
  );
}

function FacetList({ name, facets, labels }: { name: string; facets: Facet[]; labels?: Record<string, string> }) {
  const { values, toggle } = useListing();
  const selected = values(name);
  const [all, setAll] = useState(false);
  const list = all ? facets : facets.slice(0, 8);
  return (
    <div>
      {list.map((f) => (
        <CheckRow
          key={f.value}
          label={labels?.[f.value] ?? f.value}
          count={f.count}
          checked={selected.includes(f.value)}
          onChange={() => toggle(name, f.value)}
        />
      ))}
      {facets.length > 8 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-1 text-[13px] font-bold text-rose">
          {all ? "Show less" : `Show all ${facets.length}`}
        </button>
      )}
    </div>
  );
}

function PriceFilter({ range }: { range: Facets["price"] }) {
  const { params, set } = useListing();
  const min = params.get("minPrice") ?? "";
  const max = params.get("maxPrice") ?? "";
  const [draft, setDraft] = useState({ min, max });
  const [synced, setSynced] = useState({ min, max });
  if (synced.min !== min || synced.max !== max) {
    setSynced({ min, max });
    setDraft({ min, max });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        {PRICE_BANDS.map((b) => {
          const active = min === b.min && max === b.max;
          return (
            <CheckRow
              key={b.label}
              label={b.label}
              checked={active}
              onChange={() => set(active ? { minPrice: null, maxPrice: null } : { minPrice: b.min || null, maxPrice: b.max || null })}
            />
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          set({ minPrice: draft.min || null, maxPrice: draft.max || null });
        }}
        className="flex items-center gap-2"
      >
        <input
          inputMode="numeric"
          value={draft.min}
          onChange={(e) => setDraft({ ...draft, min: e.target.value.replace(/\D/g, "") })}
          placeholder={inr(range.min)}
          aria-label="Minimum price"
          className="h-10 w-full min-w-0 rounded-[6px] border border-line-strong px-3 text-sm outline-none focus:border-ink"
        />
        <span className="text-muted">–</span>
        <input
          inputMode="numeric"
          value={draft.max}
          onChange={(e) => setDraft({ ...draft, max: e.target.value.replace(/\D/g, "") })}
          placeholder={inr(range.max)}
          aria-label="Maximum price"
          className="h-10 w-full min-w-0 rounded-[6px] border border-line-strong px-3 text-sm outline-none focus:border-ink"
        />
        <button type="submit" className="h-10 shrink-0 rounded-[6px] bg-rose px-3 text-[13px] font-bold text-white">
          Go
        </button>
      </form>
    </div>
  );
}

function ColourSwatches({ facets }: { facets: Facet[] }) {
  const { values, toggle } = useListing();
  const colours = values("colour");
  return (
    <div className="flex flex-wrap gap-3">
      {facets.map((c) => {
        const active = colours.includes(c.value);
        return (
          <button key={c.value} type="button" onClick={() => toggle("colour", c.value)} className="flex w-16 flex-col items-center gap-1.5 text-center" aria-pressed={active}>
            <span
              className={cn("size-10 rounded-full border-2 transition", active ? "border-rose ring-2 ring-white ring-inset" : "border-white shadow-[0_0_0_1px_var(--color-line-strong)]")}
              style={{ background: SWATCH[c.value] ?? "#e8e2da" }}
            />
            <span className={cn("text-[12px] leading-tight", active ? "font-bold text-ink" : "text-ink-soft")}>{c.value}</span>
          </button>
        );
      })}
    </div>
  );
}

function SizeChips({ facets }: { facets: Facet[] }) {
  const { values, toggle } = useListing();
  return (
    <div className="flex flex-wrap gap-2">
      {facets.map((s) => {
        const active = values("size").includes(s.value);
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => toggle("size", s.value)}
            className={cn("min-w-11 rounded-[6px] border px-3 py-1.5 text-[13px] transition", active ? "border-rose bg-rose text-white" : "border-line-strong text-ink-soft hover:border-ink")}
            aria-pressed={active}
          >
            {s.value}
          </button>
        );
      })}
    </div>
  );
}

export type FilterGroup = { id: string; title: string; count: number; body: React.ReactNode; defaultOpen?: boolean };

/** Filter groups for the current facets; `hide` drops groups the page already scopes (e.g. category on a category page). */
export function useFilterGroups(facets: Facets, hide: string[] = []): FilterGroup[] {
  const { values, params, set } = useListing();
  const rating = params.get("rating");
  const inStock = params.get("inStock") === "1";
  const show = (k: string, list: unknown[]) => !hide.includes(k) && list.length > 0;
  const groups: FilterGroup[] = [];

  if (show("category", facets.categories)) {
    groups.push({
      id: "category",
      title: "Product Type",
      count: values("category").length,
      body: (
        <FacetList
          name="category"
          facets={facets.categories.map((c) => ({ value: c.slug, count: c.count }))}
          labels={Object.fromEntries(facets.categories.map((c) => [c.slug, c.name]))}
        />
      ),
    });
  }
  groups.push({ id: "price", title: "Price", count: params.get("minPrice") || params.get("maxPrice") ? 1 : 0, body: <PriceFilter range={facets.price} /> });
  if (show("gender", facets.genders) && facets.genders.length > 1) {
    groups.push({ id: "gender", title: "Shop For", count: values("gender").length, body: <FacetList name="gender" facets={facets.genders} />, defaultOpen: false });
  }
  if (show("colour", facets.colours)) groups.push({ id: "colour", title: "Colour", count: values("colour").length, body: <ColourSwatches facets={facets.colours} /> });
  if (show("material", facets.materials)) groups.push({ id: "material", title: "Metal", count: values("material").length, body: <FacetList name="material" facets={facets.materials} /> });
  if (show("stone", facets.stones)) groups.push({ id: "stone", title: "Stone", count: values("stone").length, body: <FacetList name="stone" facets={facets.stones} />, defaultOpen: false });
  if (show("occasion", facets.occasions)) {
    groups.push({ id: "occasion", title: "Occasion", count: values("occasion").length, body: <FacetList name="occasion" facets={facets.occasions} />, defaultOpen: false });
  }
  if (show("size", facets.sizes)) groups.push({ id: "size", title: "Size", count: values("size").length, body: <SizeChips facets={facets.sizes} />, defaultOpen: false });
  groups.push({
    id: "rating",
    title: "Rating",
    count: (rating ? 1 : 0) + (inStock ? 1 : 0),
    defaultOpen: false,
    body: (
      <div>
        {["4", "3"].map((r) => (
          <CheckRow
            key={r}
            label={
              <span className="inline-flex items-center gap-1">
                {r} <Star className="size-3.5 fill-gold text-gold" /> & above
              </span>
            }
            checked={rating === r}
            onChange={() => set({ rating: rating === r ? null : r })}
          />
        ))}
        <CheckRow label="In stock only" checked={inStock} onChange={() => set({ inStock: inStock ? null : "1" })} />
      </div>
    ),
  });
  return groups;
}

/** Stacked, collapsible filter groups (used in the mobile filter sheet). */
export function FilterPanel({ facets, hide = [] }: { facets: Facets; hide?: string[] }) {
  const groups = useFilterGroups(facets, hide);
  return (
    <div>
      {groups.map((g) => (
        <Group key={g.id} title={g.title} count={g.count} defaultOpen={g.defaultOpen ?? true}>
          {g.body}
        </Group>
      ))}
    </div>
  );
}
