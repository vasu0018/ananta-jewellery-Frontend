import type { Metadata } from "next";
import Link from "next/link";
import {
  ActionPair,
  CampaignHero,
  ColourRow,
  CuratedGrid,
  KnowMore,
  PhotoCards,
  StoreNotice,
} from "@/components/home/StoreSections";
import { getJsonSafe } from "@/lib/server-api";
import type { Category, Collection, Offer, Paged, ProductCard as Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Demifine jewellery",
  description: "Gold-plated and rose-gold plated demi-fine jewellery from Ananta.",
  alternates: { canonical: "/demifine" },
};

const EMPTY: Paged<Product> = { items: [], meta: { total: 0, page: 1, limit: 24, pages: 0 } };

export default async function DemifinePage() {
  const [list, categories, collections, offers] = await Promise.all([
    getJsonSafe<Paged<Product>>("/catalog/products?store=demifine&limit=24&sort=featured", EMPTY, { revalidate: 60, tags: ["catalog"] }),
    getJsonSafe<Category[]>("/catalog/categories", [], { revalidate: 300, tags: ["categories"] }),
    getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate: 300, tags: ["collections"] }),
    getJsonSafe<Offer[]>("/checkout/offers", [], { revalidate: 300 }),
  ]);
  const products = list.items;
  const first = products.slice(0, 12);
  const more = products.slice(12);
  const slugs = new Set(products.map((p) => p.category?.slug).filter(Boolean));
  const cats = categories.filter((c) => !c.parentId && slugs.has(c.slug));
  const colours = collections
    .filter((c) => c.type === "COLOUR" && (c.slug === "gold" || c.slug === "rose-gold"))
    .map((c) => ({ name: c.name, href: `/shop?store=demifine&colour=${encodeURIComponent(c.name)}`, image: c.image }));
  const bogo = offers.find((o) => o.type === "BUY_X_GET_Y" && !o.firstOrderOnly);

  return (
    <>
      <CampaignHero image="/uploads/stores/demifine-hero.jpg" position="object-[70%_center]">
        <div className="max-w-[560px] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          {bogo ? (
            <>
              <p className="text-[64px] font-black uppercase leading-[0.82] tracking-tight sm:text-[96px]">
                Buy 2
                <br />
                Get 1
              </p>
              <p className="mt-2 text-[22px] font-black uppercase tracking-[0.06em] sm:text-[30px]">Limited offer</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 items-center bg-white px-4 text-[14px] font-black uppercase tracking-[0.06em] text-[#1a1a1a]">Code: {bogo.code}</span>
                <Link href="/shop?store=demifine" className="inline-flex h-11 items-center bg-black px-5 text-[14px] font-black uppercase tracking-[0.08em] text-white">
                  Shop now
                </Link>
              </div>
              {bogo.description && <p className="mt-3 max-w-md text-[15px] text-white">{bogo.description}</p>}
            </>
          ) : (
            <>
              <p className="text-[48px] font-black uppercase leading-[0.9] sm:text-[72px]">Demi-fine jewellery</p>
              <Link href="/shop?store=demifine" className="mt-5 inline-flex h-11 items-center bg-black px-5 text-[14px] font-black uppercase tracking-[0.08em]">
                Shop now
              </Link>
            </>
          )}
        </div>
      </CampaignHero>

      {cats.length > 0 && (
        <div className="container-x flex gap-3 overflow-x-auto py-5">
          <Link href="/shop?store=demifine" className="inline-flex h-9 shrink-0 items-center rounded-full bg-[#243f8f] px-4 text-[13px] font-bold text-white">
            All jewellery
          </Link>
          {cats.map((c) => (
            <Link key={c.slug} href={`/shop?store=demifine&category=${c.slug}`} className="inline-flex h-9 shrink-0 items-center rounded-full border border-line px-4 text-[13px] text-ink hover:border-ink">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <ColourRow items={colours} />

      <CuratedGrid title="Demifine jewellery" products={first} moreHref="/shop?store=demifine" />

      <PhotoCards
        cards={[
          { title: "Hoops & chains", href: "/shop?store=demifine&category=earrings", image: "/uploads/stores/demifine-card-hoops.jpg" },
          { title: "Bangles", href: "/shop?store=demifine&category=bangles", image: "/uploads/stores/demifine-card-bangles.jpg" },
          { title: "Gold finish", href: "/shop?store=demifine&colour=Gold", image: "/uploads/seed/collection-gold.webp" },
          { title: "Rose gold finish", href: "/shop?store=demifine&colour=Rose%20Gold", image: "/uploads/seed/collection-rose-gold.webp" },
        ]}
      />

      {more.length > 0 && <CuratedGrid title="Explore more" products={more} moreHref="/shop?store=demifine&page=2" />}

      <StoreNotice
        store="Ananta Demifine store"
        others={[
          { label: "Silver jewellery", href: "/" },
          { label: "Gold jewellery", href: "/gold" },
        ]}
      />
      <ActionPair shopHref="/shop?store=demifine" />
      <KnowMore
        title="Know more about Demifine"
        blocks={[
          {
            heading: "What demi-fine means",
            body: "These pieces are 925 silver with an 18K gold or rose-gold plate. They are made for everyday wear, at a different price from the solid 14K gold store.",
          },
          {
            heading: "The offer",
            body: bogo?.description ?? "Offers shown on this page are the live coupons from the store, so the code at checkout is the same one on the banner.",
          },
          {
            heading: "Finishes",
            body: "Shop the gold finish or the rose-gold finish from the colour row. Every photo in the grid is the product photo saved in admin.",
          },
        ]}
      />
    </>
  );
}
