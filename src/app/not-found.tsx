import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getJsonSafe } from "@/lib/server-api";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Page not found" };

export default async function NotFound() {
  const categories = await getJsonSafe<Category[]>("/catalog/categories", [], { revalidate: 300, tags: ["categories"] });

  return (
    <div className="container-x flex flex-col items-center py-20 text-center sm:py-28">
      <p className="font-display text-[110px] leading-none text-gold-soft sm:text-[160px]" aria-hidden>
        404
      </p>
      <h1 className="-mt-4 font-display text-4xl text-ink sm:text-5xl">This piece has gone missing</h1>
      <p className="mt-4 max-w-md text-[15px] text-muted">The page you&apos;re looking for may have moved or is no longer available. Let&apos;s find you something just as lovely.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/shop">Shop all jewellery</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
      {categories.length > 0 && (
        <nav aria-label="Popular categories" className="mt-12">
          <p className="eyebrow mb-4">Popular categories</p>
          <ul className="flex max-w-2xl flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="block rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition hover:border-ink hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
