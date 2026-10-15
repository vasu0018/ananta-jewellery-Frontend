import type { Metadata } from "next";
import Link from "next/link";
import { Gift, PenLine, Truck } from "lucide-react";
import { Listing } from "@/components/listing/Listing";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { BondCards, CollectionTiles } from "@/components/home/Tiles";
import { Img } from "@/components/ui/Img";
import { getJsonSafe } from "@/lib/server-api";
import type { Banner, Collection } from "@/lib/types";

export const metadata: Metadata = {
  title: "Gifting — Jewellery Gifts for Every Bond & Budget",
  description: "Find the perfect jewellery gift for her, him, mom or your best friend. Signature gift box, personal note and free shipping above ₹999.",
  alternates: { canonical: "/gifting" },
};

export default async function GiftingPage({ searchParams }: PageProps<"/gifting">) {
  const [sp, banners, collections] = await Promise.all([
    searchParams,
    getJsonSafe<Banner[]>("/content/banners?placement=GIFTING", [], { revalidate: 300 }),
    getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate: 300, tags: ["collections"] }),
  ]);
  const banner = banners[0];
  const bonds = collections.filter((c) => c.type === "BOND");
  const budgets = collections.filter((c) => c.type === "GIFTING");

  return (
    <>
      <div className="container-x pt-4">
        <Breadcrumbs items={[{ label: "Gifting" }]} className="mb-4" />
        <div className="relative overflow-hidden rounded-3xl bg-blush">
          <div className="relative h-64 sm:h-80">
            {banner && <Img src={banner.image} alt="" fill preload sizes="100vw" className="object-cover object-[75%_center]" />}
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
            <div className="relative flex h-full max-w-xl flex-col justify-center px-6 sm:px-12">
              <p className="eyebrow mb-2">The gifting store</p>
              <h1 className="font-display text-4xl font-medium leading-tight text-ink sm:text-6xl">{banner?.title ?? "The Gifting Edit"}</h1>
              <p className="mt-3 text-[15px] text-ink-soft">{banner?.subtitle ?? "Curated gifts for every bond and budget."}</p>
            </div>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Gift, title: "Signature gift box", body: "Every order arrives beautifully boxed" },
            { icon: PenLine, title: "Personal note", body: "Add a handwritten message at checkout" },
            { icon: Truck, title: "Fast, free delivery", body: "On orders above ₹999, pan-India" },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <Icon className="size-5 shrink-0 text-gold" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="text-xs text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {bonds.length > 0 && (
        <section className="container-x pt-14">
          <h2 className="mb-6 text-center font-display text-3xl text-ink">Who are you shopping for?</h2>
          <BondCards collections={bonds} />
        </section>
      )}

      {budgets.length > 0 && (
        <section className="container-x pt-14">
          <h2 className="mb-6 text-center font-display text-3xl text-ink">Gifts by budget</h2>
          <CollectionTiles collections={budgets} columns={3} aspect="aspect-[16/10]" />
        </section>
      )}

      <section className="container-x pt-16">
        <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
          <h2 className="font-display text-3xl text-ink">All gifts</h2>
          <Link href="/collections" className="text-[13px] font-medium text-rose-dark underline underline-offset-4">
            Browse collections
          </Link>
        </div>
        <Listing searchParams={sp} base={{ gift: "1" }} title="All Gifts" />
      </section>
    </>
  );
}
