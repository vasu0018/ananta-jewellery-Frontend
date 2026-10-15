import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/listing/Pagination";
import { EmptyState } from "@/components/ui/misc";
import { getJsonSafe } from "@/lib/server-api";
import { cn, qs } from "@/lib/utils";
import type { BlogPostCard, Paged } from "@/lib/types";

const PER_PAGE = 9;
const TABS = [
  { type: "", label: "All stories" },
  { type: "BLOG", label: "Journal" },
  { type: "LOOKBOOK", label: "Lookbook" },
] as const;

export const metadata: Metadata = {
  title: "The Journal — style notes, care guides & lookbooks",
  description: "Jewellery care tips, gifting guides, styling ideas and seasonal lookbooks from the Ananta Jewellery team.",
  alternates: { canonical: "/blog" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const type = TABS.some((t) => t.type === first(sp.type)) ? first(sp.type) : "";
  const page = Math.max(1, Number.parseInt(first(sp.page), 10) || 1);
  const data = await getJsonSafe<Paged<BlogPostCard>>(`/content/blog${qs({ page, limit: PER_PAGE, type })}`, {
    items: [],
    meta: { total: 0, page, limit: PER_PAGE, pages: 1 },
  });
  const [lead, ...rest] = data.items;
  const featured = page === 1 && lead;

  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Style notes & stories"
        description="Care guides, gifting ideas and the inspiration behind our collections."
        crumbs={[{ label: "Journal" }]}
      />
      <div className="container-x pb-16">
        <nav aria-label="Story type" className="mb-10 flex justify-center gap-2">
          {TABS.map((t) => (
            <Link
              key={t.label}
              href={`/blog${qs({ type: t.type })}`}
              aria-current={type === t.type ? "page" : undefined}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition",
                type === t.type ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {!data.items.length ? (
          <EmptyState title="No stories yet" description="Check back soon for styling notes and new lookbooks." />
        ) : (
          <>
            {featured && (
              <div className="mb-12">
                <PostCard post={lead} large />
              </div>
            )}
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {(featured ? rest : data.items).map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
            <div className="mt-12">
              <Pagination page={page} totalPages={data.meta.pages} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
