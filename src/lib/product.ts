import type { ProductCard, ProductDetail } from "./types";

/** Card-shaped copy of a product detail (for compare, frequently-bought-together). */
export function toCard(p: ProductDetail): ProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    discountPct: p.discountPct,
    image: p.images[0]?.url ?? null,
    hoverImage: p.images[1]?.url ?? null,
    category: p.category ? { id: "", name: p.category.name, slug: p.category.slug } : null,
    material: p.material,
    colour: p.colour,
    stone: p.stone,
    occasions: p.occasions,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    isBestseller: p.isBestseller,
    isNewArrival: p.isNewArrival,
    inStock: p.inStock,
    stock: p.stock,
    defaultVariantId: p.variants[0]?.id ?? null,
    variants: p.variants,
    flashSale: p.flashSale,
  };
}
