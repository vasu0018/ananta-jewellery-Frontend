import type { Metadata } from "next";
import {
  ActionPair,
  CampaignHero,
  ColourRow,
  CuratedGrid,
  KnowMore,
  LatestCollections,
  PhotoCards,
  StoreNotice,
} from "@/components/home/StoreSections";
import { getJsonSafe } from "@/lib/server-api";
import type { Collection, Paged, ProductCard as Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Gold jewellery",
  description: "14K gold and IGI-certified lab-grown diamond jewellery from Ananta.",
  alternates: { canonical: "/gold" },
};

const EMPTY: Paged<Product> = { items: [], meta: { total: 0, page: 1, limit: 24, pages: 0 } };

export default async function GoldPage() {
  const [list, collections] = await Promise.all([
    getJsonSafe<Paged<Product>>("/catalog/products?store=gold&limit=24&sort=featured", EMPTY, { revalidate: 60, tags: ["catalog"] }),
    getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate: 300, tags: ["collections"] }),
  ]);
  const products = list.items;
  const colours = collections
    .filter((c) => c.type === "COLOUR" && (c.slug === "gold" || c.slug === "rose-gold"))
    .map((c) => ({ name: c.name, href: `/collections/${c.slug}`, image: c.image }));

  return (
    <>
      <CampaignHero image="/uploads/stores/gold-hero.jpg" position="object-right">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_1fr_0.7fr]">
          <div className="max-w-[340px] rounded-[16px] bg-[#f7f1e4]/85 p-4 backdrop-blur-[2px] sm:p-5">
            <p className="text-[15px] leading-snug text-[#3a342c] sm:text-[17px]">Buy diamonds with confidence. Every Ananta gold piece is</p>
            <p className="mt-4 inline-flex items-end gap-3 border-2 border-[#1c3d36] bg-white/70 px-3 py-1">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#1c3d36] sm:text-[15px]">Diamond</span>
              <span className="text-[34px] italic leading-none text-[#1f6a45] sm:text-[42px]">Certified</span>
            </p>
            <p className="mt-5 text-[28px] font-black uppercase leading-[0.9] tracking-tight text-[#1a1a1a] sm:text-[40px]">
              IGI
              <br />
              certified
            </p>
            <p className="mt-2 text-[12px] text-[#5c564c]">Set in 14K gold. Lab-grown diamonds, same sparkle.</p>
          </div>
          <div className="hidden text-center lg:block">
            <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#3a342c]">Crafted in</p>
            <p className="mt-1 text-[48px] italic leading-none text-[#1a1a1a]">14K Gold</p>
            <div className="mx-auto mt-5 flex max-w-[380px] items-center justify-center gap-3">
              <div className="rounded-md bg-[#d9d3c6]/90 px-4 py-3 text-[#3a342c]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Stone</p>
                <p className="text-[18px] font-semibold">Lab grown</p>
              </div>
              <span className="text-[13px] font-bold text-[#6b6458]">vs</span>
              <div className="rounded-md bg-[#d9d3c6]/90 px-4 py-3 text-[#3a342c]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em]">Look</p>
                <p className="text-[18px] font-semibold">Mined sparkle</p>
              </div>
            </div>
            <p className="mt-4 text-[16px] font-black uppercase tracking-[0.16em] text-[#1a1a1a]">Same sparkle, fair price</p>
          </div>
          <div />
        </div>
      </CampaignHero>

      <ColourRow items={colours} />

      <LatestCollections products={products} href="/shop?store=gold" />

      <PhotoCards
        cards={[
          { title: "Rings", href: "/shop?store=gold&category=rings", image: "/uploads/stores/gold-card-ring.jpg" },
          { title: "Pendants", href: "/shop?store=gold&category=pendants", image: "/uploads/stores/gold-card-pendant.jpg" },
          { title: "Lab-grown diamonds", href: "/collections/lab-grown-diamonds", image: "/uploads/seed/collection-lab-grown-diamonds.webp" },
          { title: "Anniversary", href: "/collections/anniversary-gifts", image: "/uploads/seed/collection-anniversary-gifts.webp" },
        ]}
      />

      <CuratedGrid title="A curated collection" products={products} moreHref="/shop?store=gold" />

      <StoreNotice
        store="Ananta Gold store"
        others={[
          { label: "Silver jewellery", href: "/" },
          { label: "Demifine jewellery", href: "/demifine" },
        ]}
      />
      <ActionPair shopHref="/shop?store=gold" />
      <KnowMore
        title="Know more about Ananta Gold"
        blocks={[
          {
            heading: "The gold store",
            body: "This edit is 14K gold set with IGI-certified lab-grown diamonds. Gold-plated silver is not listed here — that lives in the Demifine store.",
          },
          {
            heading: "What you are buying",
            body: "Lab-grown diamonds have the same sparkle as mined stones and are set in real 14K gold. Prices, photos and stock on this page come from the catalog, so what you add to cart is the piece you check out.",
          },
          {
            heading: "Shopping experience",
            body: "Filter by category, check delivery from your pincode on the product page, and use Customise if you want a different size or a note for the studio. Switch stores any time from the tabs above.",
          },
        ]}
      />
    </>
  );
}
