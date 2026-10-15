"use client";

import { useEffect, useState } from "react";
import { track } from "@/hooks/useShop";
import { useRecentlyViewed } from "@/stores/lists";
import { cn, resolveHtmlMedia } from "@/lib/utils";
import type { ProductDetail } from "@/lib/types";

/** Records a product view (analytics + recently viewed) once per mount. */
export function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    track("product_view");
    // Recently-viewed is persisted; wait for rehydration so we don't overwrite the stored list.
    const push = () => useRecentlyViewed.getState().push(productId);
    if (useRecentlyViewed.persist.hasHydrated()) push();
    else return useRecentlyViewed.persist.onFinishHydration(push);
  }, [productId]);
  return null;
}

/** Description / specifications / care tabs. */
export function ProductDetails({ product }: { product: ProductDetail }) {
  const specs: [string, string | null | undefined][] = [
    ["SKU", product.sku],
    ["Material", product.material],
    ["Colour", product.colour],
    ["Stone", product.stone && product.stone !== "None" ? product.stone : null],
    ["Weight", product.weight ? `${product.weight} g` : null],
    [
      "Dimensions",
      [product.dimensions.length, product.dimensions.width, product.dimensions.height].some(Boolean)
        ? [product.dimensions.length, product.dimensions.width, product.dimensions.height].filter(Boolean).join(" × ") + " mm"
        : null,
    ],
    ["Occasion", product.occasions.join(", ")],
    ["Gender", product.gender],
    ["Certificate", product.hasCertificate ? "Included" : null],
    ["Warranty", product.warranty],
  ];
  const tabs = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Specifications" },
    { id: "care", label: "Care & returns" },
  ];
  const [active, setActive] = useState("description");

  return (
    <section className="mt-16">
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "relative shrink-0 px-5 py-3 text-[13px] font-medium uppercase tracking-[0.12em] transition",
              active === t.id ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-ink" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-8" role="tabpanel">
        {active === "description" &&
          (product.description ? (
            <div className="prose-ananta max-w-3xl" dangerouslySetInnerHTML={{ __html: resolveHtmlMedia(product.description) }} />
          ) : (
            <p className="text-sm text-muted">{product.shortDescription}</p>
          ))}
        {active === "specs" && (
          <dl className="grid max-w-3xl overflow-hidden rounded-2xl border border-line sm:grid-cols-2">
            {specs
              .filter(([, v]) => !!v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-4 border-b border-line px-5 py-3.5 text-sm sm:odd:border-r">
                  <dt className="w-28 shrink-0 text-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
          </dl>
        )}
        {active === "care" && (
          <div className="grid max-w-4xl gap-6 text-sm leading-6 text-ink-soft sm:grid-cols-2">
            <div className="rounded-2xl bg-cream p-5">
              <p className="mb-2 font-display text-xl text-ink">Caring for your piece</p>
              <p>{product.careInstructions ?? "Store in the pouch provided, away from moisture. Avoid perfume and chemicals, and wipe gently with a soft cloth after wearing."}</p>
            </div>
            <div className="rounded-2xl bg-cream p-5">
              <p className="mb-2 font-display text-xl text-ink">Shipping & returns</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Free shipping on orders above ₹999</li>
                <li>Dispatched within 24–48 hours</li>
                <li>Easy 30-day returns and exchanges</li>
                <li>{product.warranty ?? "Lifetime plating service"}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
