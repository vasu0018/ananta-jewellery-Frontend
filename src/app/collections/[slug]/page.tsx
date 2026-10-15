import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/listing/Listing";
import { PageHeader } from "@/components/layout/PageHeader";
import { getJsonOrNull } from "@/lib/server-api";
import { media, titleCase } from "@/lib/utils";
import { pageTitle } from "@/lib/seo";
import type { Collection } from "@/lib/types";

const getCollection = (slug: string) => getJsonOrNull<Collection>(`/catalog/collections/${encodeURIComponent(slug)}`, { revalidate: 300 });

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return { title: "Collection not found" };
  const title = c.seoTitle || c.name;
  const description = c.seoDescription || c.description || `Discover the ${c.name} collection — handcrafted silver and lab-grown diamond jewellery.`;
  const image = media(c.bannerImage ?? c.image);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const [collection, sp] = await Promise.all([getCollection(slug), searchParams]);
  if (!collection) notFound();

  return (
    <>
      <PageHeader
        title={collection.name}
        description={collection.description}
        crumbs={[{ label: "Collections", href: "/collections" }, { label: collection.name }]}
        banner={collection.bannerImage}
        eyebrow={titleCase(collection.type) + " edit"}
      />
      <div className={collection.bannerImage ? "container-x pt-8" : "container-x"}>
        <Listing searchParams={sp} base={{ collection: collection.slug }} title={collection.name} />
      </div>
    </>
  );
}
