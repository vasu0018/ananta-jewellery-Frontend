import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Listing } from "@/components/listing/Listing";
import { PageHeader } from "@/components/layout/PageHeader";
import { Img } from "@/components/ui/Img";
import { getJsonOrNull } from "@/lib/server-api";
import { media } from "@/lib/utils";
import { pageTitle } from "@/lib/seo";
import type { CategoryDetail } from "@/lib/types";

const getCategory = (slug: string) => getJsonOrNull<CategoryDetail>(`/catalog/categories/${encodeURIComponent(slug)}`, { revalidate: 300 });

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategory(slug);
  if (!c) return { title: "Category not found" };
  const title = c.seoTitle || `${c.name} — Silver & Gold-Plated ${c.name}`;
  const description = c.seoDescription || c.description || `Shop ${c.name.toLowerCase()} in certified 925 silver and lab-grown diamonds. Free shipping, 30-day returns & COD.`;
  const image = media(c.bannerImage ?? c.image);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const [category, sp] = await Promise.all([getCategory(slug), searchParams]);
  if (!category) notFound();

  const crumbs = [
    { label: "Shop", href: "/shop" },
    ...(category.parent ? [{ label: category.parent.name, href: `/category/${category.parent.slug}` }] : []),
    { label: category.name },
  ];

  const intro = category.children.length ? (
    <div className="no-scrollbar -mx-4 mb-6 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {category.children.map((c) => (
        <Link key={c.id} href={`/category/${c.slug}`} className="group flex shrink-0 items-center gap-2.5 rounded-full border border-line-strong bg-white py-1.5 pl-1.5 pr-4 transition hover:border-rose">
          <span className="relative size-9 overflow-hidden rounded-full bg-cream">
            <Img src={c.image} alt="" fill sizes="36px" className="object-cover" />
          </span>
          <span className="text-[14px] text-ink">{c.name}</span>
        </Link>
      ))}
    </div>
  ) : null;

  return (
    <>
      <PageHeader title={category.name} description={category.description} crumbs={crumbs} banner={category.bannerImage} eyebrow={category.parent ? category.parent.name : "Shop"} />
      <div className={category.bannerImage ? "container-x pt-8" : "container-x"}>
        <Listing searchParams={sp} base={{ category: category.slug }} hide={["category"]} intro={intro} title={category.name} />
      </div>
    </>
  );
}
