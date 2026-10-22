import { HeroCarousel } from "@/components/home/HeroCarousel";
import {
  BondPortraits,
  CategoryTiles,
  ColourCards,
  DailyOffers,
  GiftingPrices,
  KnowMore,
  NewLaunch,
  OfferHeader,
  PromoBanners,
  Title,
  TrustBadges,
  ViewMore,
  WideBanners,
  WorldOf,
} from "@/components/home/Sections";
import { ProductCard } from "@/components/product/ProductCard";
import { getJsonSafe } from "@/lib/server-api";
import { getSettings } from "@/lib/settings";
import type { HomeData, Offer, ProductCard as Product } from "@/lib/types";

export const revalidate = 60;

const EMPTY: HomeData = {
  banners: { hero: [], strip: [], promo: [], gifting: [] },
  categories: [],
  bestsellers: [],
  newArrivals: [],
  giftingPicks: [],
  collections: { colour: [], bond: [], occasion: [], celebrity: [], gifting: [], curated: [] },
  flashSale: null,
  posts: [],
};

function Grid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

const maxDiscount = (products: Product[]) => Math.max(0, ...products.map((p) => p.discountPct ?? 0));

/** Request time for the "Deal of the day" calendar; the page is regenerated every minute. */
function requestTime() {
  return Date.now();
}

export default async function HomePage() {
  const [home, offers, settings, forHim] = await Promise.all([
    getJsonSafe<HomeData>("/catalog/home", EMPTY, { revalidate: 60, tags: ["home"] }),
    getJsonSafe<Offer[]>("/checkout/offers", [], { revalidate: 300 }),
    getSettings(),
    getJsonSafe<{ items: Product[] }>("/catalog/products?gender=Men&sort=popular&limit=4", { items: [] }, { revalidate: 300, tags: ["home"] }),
  ]);
  const { banners, collections } = home;
  const storeName = settings.store.name;
  const allProducts = [...home.bestsellers, ...home.newArrivals, ...home.giftingPicks];
  const world = [...collections.celebrity, ...collections.curated, ...collections.occasion];
  const mostGifted = home.giftingPicks.slice(0, 4);
  const giftOff = maxDiscount(mostGifted);
  const himOff = maxDiscount(forHim.items);
  const bannerOf = (list: { slug: string; bannerImage: string | null }[], slug: string) => list.find((c) => c.slug === slug)?.bannerImage;
  const giftedImages = [bannerOf(collections.gifting, "anniversary-gifts"), bannerOf(collections.bond, "for-her")];
  const himImages = [bannerOf(collections.bond, "for-him"), bannerOf(home.categories, "men")];
  const explore = [...home.bestsellers, ...home.newArrivals.filter((p) => !home.bestsellers.some((b) => b.id === p.id))].slice(0, 12);

  return (
    <>
      <HeroCarousel banners={banners.hero} />

      {home.categories.length > 0 && (
        <section className="container-x pt-2 lg:pt-4">
          <CategoryTiles categories={home.categories} offers={offers} />
        </section>
      )}

      <TrustBadges freeShippingAbove={settings.checkout.freeShippingAbove} />

      {home.flashSale && home.flashSale.products.length > 0 && <DailyOffers sale={home.flashSale} now={requestTime()} />}

      <PromoBanners banners={banners.promo} />

      <WorldOf storeName={storeName} collections={world} />

      <GiftingPrices collections={collections.gifting} />

      <WideBanners banners={[...banners.gifting, ...banners.strip]} />

      {mostGifted.length > 0 && (
        <section className="bg-[linear-gradient(180deg,#fde6ea_0%,#fff8f9_100%)] py-8 sm:py-10">
          <div className="container-x">
            <OfferHeader
              title="Most Gifted"
              sub="We've curated the best of our collection just for you"
              tag={giftOff > 0 ? `Upto ${giftOff}% OFF` : undefined}
              images={giftedImages}
            />
            <Grid products={mostGifted} />
            <ViewMore href="/gifting" />
          </div>
        </section>
      )}

      <NewLaunch products={home.newArrivals} />

      <ColourCards collections={collections.colour} products={allProducts} />

      <BondPortraits collections={collections.bond} />

      {forHim.items.length > 0 && (
        <section className="bg-[#fbeee8] py-8 sm:py-10">
          <div className="container-x">
            <OfferHeader
              dark
              title="Gifts for Him"
              sub="Jewellery he'll actually wear"
              tag={himOff > 0 ? `Upto ${himOff}% OFF` : undefined}
              images={himImages}
            />
            <Grid products={forHim.items} />
            <ViewMore href="/shop?gender=Men" />
          </div>
        </section>
      )}

      {explore.length > 0 && (
        <section className="container-x py-9 sm:py-12">
          <Title>Explore Now</Title>
          <Grid products={explore} />
          <ViewMore href="/shop?sort=popular" />
        </section>
      )}

      <KnowMore
        storeName={storeName}
        paragraphs={[
          `${storeName} makes fine jewellery in certified 925 sterling silver, 18K gold plating and IGI-certified lab-grown diamonds — designed to be worn every day and gifted for every occasion.`,
          "Every piece is hallmarked, nickel-free and hypoallergenic, and comes with a certificate of authenticity, lifetime plating service and our signature gift box.",
          "Shop rings, earrings, necklaces, pendants, bracelets, bangles, anklets, mangalsutras and nose pins for women, plus chains, rings and bracelets for men. Enjoy free shipping, cash on delivery and easy 30-day returns across India.",
        ]}
      />
    </>
  );
}
