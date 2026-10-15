import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectionTiles } from "@/components/home/Tiles";
import { getJsonSafe } from "@/lib/server-api";
import type { Collection, CollectionType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore our curated jewellery edits — by colour, occasion, relationship and celebrity collaborations.",
  alternates: { canonical: "/collections" },
};

export const revalidate = 300;

const GROUPS: { type: CollectionType; title: string; description: string }[] = [
  { type: "CURATED", title: "Signature edits", description: "Our most-loved stories, curated by the Ananta studio." },
  { type: "CELEBRITY", title: "Celebrity collaborations", description: "Designed with the stars, made for you." },
  { type: "OCCASION", title: "By occasion", description: "From the office to the mandap." },
  { type: "COLOUR", title: "By colour", description: "Silver, gold, rose gold or oxidised — pick your metal." },
  { type: "BOND", title: "For the people you love", description: "Gifts for every bond." },
  { type: "GIFTING", title: "Gifts by budget", description: "Thoughtful picks at every price." },
];

export default async function CollectionsPage() {
  const all = await getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate: 300, tags: ["collections"] });
  return (
    <>
      <PageHeader title="Collections" description="Every piece tells a story. Find the edit that tells yours." crumbs={[{ label: "Collections" }]} eyebrow="Explore" />
      <div className="container-x space-y-16">
        {GROUPS.map((g) => {
          const list = all.filter((c) => c.type === g.type);
          if (!list.length) return null;
          return (
            <section key={g.type}>
              <div className="mb-6 border-b border-line pb-4">
                <h2 className="font-display text-3xl text-ink">{g.title}</h2>
                <p className="mt-1 text-sm text-muted">{g.description}</p>
              </div>
              <CollectionTiles collections={list} columns={list.length === 3 ? 3 : 4} />
            </section>
          );
        })}
      </div>
    </>
  );
}
