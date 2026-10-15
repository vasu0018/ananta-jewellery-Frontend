import type { Metadata } from "next";
import { Listing } from "@/components/listing/Listing";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBox } from "@/components/layout/SearchBox";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const q = (await searchParams).q;
  const term = Array.isArray(q) ? q[0] : q;
  return { title: term ? `Search: ${term}` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  return (
    <>
      <PageHeader
        title={q ? `“${q}”` : "Search"}
        description={q ? undefined : "Find rings, earrings, gifts and more."}
        crumbs={[{ label: "Search" }]}
        eyebrow={q ? "Search results for" : undefined}
      />
      <div className="container-x">
        {!q && (
          <div className="mx-auto mb-12 max-w-xl">
            <SearchBox variant="panel" autoFocus />
          </div>
        )}
        {q && <Listing searchParams={sp} title={`Results for “${q}”`} emptyHint={`We couldn't find anything for “${q}”. Try a broader word like “ring” or “silver”.`} />}
      </div>
    </>
  );
}
