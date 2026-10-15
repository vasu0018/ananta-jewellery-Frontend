import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProductView } from "@/components/product/ProductView";
import { ProductDetails, ViewTracker } from "@/components/product/ProductDetails";
import { FrequentlyBought } from "@/components/product/FrequentlyBought";
import { Reviews } from "@/components/product/Reviews";
import { ProductRail } from "@/components/product/ProductRail";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { toCard } from "@/lib/product";
import { JsonLd } from "@/components/seo/JsonLd";
import { getJsonOrNull, getJsonSafe } from "@/lib/server-api";
import { SITE_URL } from "@/lib/config";
import { pageTitle } from "@/lib/seo";
import { media, stripHtml } from "@/lib/utils";
import type { ProductCard, ProductDetail } from "@/lib/types";

const getProduct = (slug: string) => getJsonOrNull<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`, { revalidate: 60 });

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found" };
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || stripHtml(p.description) || p.shortDescription || undefined;
  const images = p.images.slice(0, 4).map((i) => ({ url: media(i.url)!, alt: i.alt }));
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", title, description, images },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const recs = await getJsonSafe<{ related: ProductCard[]; frequentlyBoughtTogether: ProductCard[] }>(
    `/catalog/products/${product.slug}/recommendations`,
    { related: [], frequentlyBoughtTogether: [] },
    { revalidate: 300 },
  );

  const crumbs = [
    { label: "Shop", href: "/shop" },
    ...(product.category?.parent ? [{ label: product.category.parent.name, href: `/category/${product.category.parent.slug}` }] : []),
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
    { label: product.name },
  ];

  const url = `${SITE_URL}/products/${product.slug}`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: stripHtml(product.description, 5000) || product.shortDescription,
    image: product.images.map((i) => media(i.url)),
    brand: { "@type": "Brand", name: "Ananta Jewellery" },
    category: product.category?.name,
    material: product.material ?? undefined,
    color: product.colour ?? undefined,
    url,
    offers:
      product.variants.length > 1
        ? {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min(...product.variants.map((v) => v.price)),
            highPrice: Math.max(...product.variants.map((v) => v.price)),
            offerCount: product.variants.length,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          }
        : {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: product.price,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
    ...(product.reviewSummary.total > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.reviewSummary.average, reviewCount: product.reviewSummary.total, bestRating: 5 } }
      : {}),
  };

  return (
    <div className="container-x pt-4">
      <JsonLd data={productLd} />
      <ViewTracker productId={product.id} />
      <Breadcrumbs items={crumbs} className="mb-4 lg:mx-auto lg:max-w-[988px] xl:max-w-[1012px]" />
      <ProductView product={product} />
      <ProductDetails product={product} />
      {recs.frequentlyBoughtTogether.length > 0 && <FrequentlyBought current={toCard(product)} items={recs.frequentlyBoughtTogether} />}
      <div className="mt-16">
        <Reviews productId={product.id} slug={product.slug} summary={product.reviewSummary} />
      </div>
      {recs.related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-3xl text-ink">You may also like</h2>
          <ProductRail products={recs.related} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
