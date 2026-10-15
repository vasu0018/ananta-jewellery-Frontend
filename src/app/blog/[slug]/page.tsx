import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { PostCard, postKind } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { pageTitle } from "@/lib/seo";
import { getJsonOrNull } from "@/lib/server-api";
import { media, resolveHtmlMedia, stripHtml } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const getPost = (slug: string) => getJsonOrNull<BlogPost>(`/content/blog/${encodeURIComponent(slug)}`, { revalidate: 300, tags: ["blog"] });

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Story not found" };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || stripHtml(post.content);
  const image = media(post.coverImage);
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const kind = postKind(post.type);
  const cover = media(post.coverImage);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? stripHtml(post.content),
    image: cover ? [cover] : undefined,
    datePublished: post.publishedAt ?? undefined,
    author: { "@type": "Organization", name: post.author || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon/512` } },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags?.join(", "),
  };

  return (
    <article className="pb-16">
      <JsonLd data={articleLd} />
      <div className="container-x pt-4">
        <Breadcrumbs items={[{ label: "Journal", href: "/blog" }, { label: post.title }]} />
      </div>

      <header className="container-x mx-auto max-w-3xl py-10 text-center sm:py-14">
        <p className="eyebrow mb-3">
          {kind}
          {post.publishedAt && <span className="text-muted"> · {formatDate(post.publishedAt)}</span>}
        </p>
        <h1 className="font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{post.excerpt}</p>}
        {post.author && <p className="mt-5 text-sm text-ink-soft">By {post.author}</p>}
      </header>

      {cover && (
        <div className="container-x">
          <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-3xl bg-cream">
            <Img src={post.coverImage} alt={post.title} fill preload sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-x">
        <div className="prose-ananta mx-auto mt-12 max-w-2xl text-[16.5px]" dangerouslySetInnerHTML={{ __html: resolveHtmlMedia(post.content) }} />

        {post.tags && post.tags.length > 0 && (
          <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t} className="rounded-full bg-cream px-3 py-1 text-xs text-ink-soft">
                #{t}
              </li>
            ))}
          </ul>
        )}

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-3xl bg-blush/60 p-6">
          <div>
            <p className="font-display text-2xl text-ink">Find your next favourite</p>
            <p className="mt-1 text-sm text-ink-soft">Certified 925 silver and lab-grown diamonds, made to be worn every day.</p>
          </div>
          <Button asChild>
            <Link href="/shop">Shop now</Link>
          </Button>
        </div>
      </div>

      {post.more.length > 0 && (
        <section className="container-x mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="section-title">More stories</h2>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink">
              <ArrowLeft className="size-4" /> All stories
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {post.more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
