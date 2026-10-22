import type { Metadata } from "next";
import { Listing } from "@/components/listing/Listing";
import { PageHeader } from "@/components/layout/PageHeader";

type Flags = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function heading(sp: Flags) {
  const store = one(sp.store);
  if (store === "gold") return { title: "Gold jewellery", description: "14K gold and IGI-certified lab-grown diamonds." };
  if (store === "demifine") return { title: "Demifine jewellery", description: "Gold-plated and rose-gold plated jewellery for every day." };
  if (store === "silver") return { title: "Silver jewellery", description: "Certified 925 sterling and oxidised silver." };
  if (sp.newArrival === "1") return { title: "New arrivals", description: "Fresh off the bench — the newest designs from our studio." };
  if (sp.flashSale === "1") return { title: "Flash sale", description: "Limited-time prices on our most-loved pieces. Hurry, they won't last." };
  if (sp.bestseller === "1" || sp.sort === "popular") return { title: "Bestsellers", description: "The pieces our customers can't stop wearing (and gifting)." };
  if (sp.gift === "1") return { title: "Gifts", description: "Wrapped, boxed and ready to make someone's day." };
  return { title: "All jewellery", description: "Certified 925 silver, gold-plated and lab-grown diamond jewellery for every day and every occasion." };
}

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { title, description } = heading(await searchParams);
  return { title, description, alternates: { canonical: "/shop" } };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const { title, description } = heading(sp);
  return (
    <>
      <PageHeader title={title} description={description} crumbs={[{ label: title }]} eyebrow="Shop" />
      <div className="container-x">
        <Listing searchParams={sp} title={title} />
      </div>
    </>
  );
}
