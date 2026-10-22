import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCard as Product } from "@/lib/types";

/** Full-bleed campaign photo. Children sit on top of the image. */
export function CampaignHero({ image, children, position = "object-[72%_center]" }: { image: string; children: React.ReactNode; position?: string }) {
  return (
    <section className="relative min-h-[480px] overflow-hidden bg-[#f3ead8] sm:min-h-[540px] lg:min-h-[600px]">
      <Img src={image} alt="" fill preload sizes="100vw" className={`object-cover ${position}`} />
      <div className="container-x relative z-10 flex min-h-[480px] items-center py-10 sm:min-h-[540px] lg:min-h-[600px]">{children}</div>
    </section>
  );
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-6 text-center">
      {kicker && <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-rose sm:text-[13px]">{kicker}</p>}
      <h2 className="mt-1 text-[28px] font-semibold tracking-tight text-ink sm:text-[40px]">{title}</h2>
    </div>
  );
}

export function ColourRow({ items }: { items: { name: string; href: string; image: string | null }[] }) {
  if (!items.length) return null;
  return (
    <section className="container-x py-10 sm:py-14">
      <SectionTitle kicker="Your style, your way" title="Shop by colour" />
      <div className="flex gap-6 overflow-x-auto pb-2 sm:justify-center">
        {items.map((c) => (
          <Link key={c.href} href={c.href} className="group w-[92px] shrink-0 text-center sm:w-[120px]">
            <span className="relative block aspect-square overflow-hidden rounded-full bg-cream ring-1 ring-[#eadfce]">
              <Img src={c.image} alt={c.name} fill sizes="120px" className="object-cover transition duration-500 group-hover:scale-105" />
            </span>
            <span className="mt-2 block text-[14px] text-ink sm:text-[16px]">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Photo row for the gold store. A short list sits centred under the title; a longer list fills the row. */
export function LatestCollections({ products, href }: { products: Product[]; href: string }) {
  const shown = products.slice(0, 6);
  if (!shown.length) return null;
  const few = shown.length <= 3;
  return (
    <section className="bg-[#faf7f2] py-10 sm:py-14">
      <div className="container-x">
        <SectionTitle title="Latest collections" />
        <div className={few ? "mx-auto grid max-w-5xl grid-cols-3 gap-4 sm:gap-8" : "grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6"}>
          {shown.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[12px] bg-white">
                <Img src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 280px, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </span>
              <span className="mt-2 line-clamp-2 block text-center text-[13px] leading-snug text-ink sm:text-[15px]">{p.name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href={href} className="inline-flex h-11 items-center rounded-full border border-ink px-8 text-[14px] text-ink hover:bg-ink hover:text-white">
            View the collection
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PhotoCards({ cards }: { cards: { title: string; href: string; image: string }[] }) {
  return (
    <section className="container-x py-10 sm:py-12">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {cards.map((c) => (
          <Link key={c.href + c.title} href={c.href} className="group relative block aspect-[4/5] overflow-hidden rounded-[14px] bg-cream">
            <Img src={c.image} alt={c.title} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-[15px] font-semibold text-white sm:text-[18px]">{c.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CuratedGrid({ title, products, moreHref }: { title: string; products: Product[]; moreHref: string }) {
  return (
    <section className="container-x pb-6">
      <SectionTitle title={title} />
      {products.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-[12px] bg-cream px-5 py-8 text-center text-[15px] text-ink-soft">No pieces in this store yet.</p>
      )}
      <div className="mt-8 text-center">
        <Link href={moreHref} className="inline-flex h-11 items-center rounded-[10px] border border-[#373737] bg-white px-10 text-[15px] text-ink hover:bg-cream">
          View more
        </Link>
      </div>
    </section>
  );
}

export function StoreNotice({ store, others }: { store: string; others: { label: string; href: string }[] }) {
  return (
    <section className="mx-auto my-8 max-w-[920px] px-4 text-center">
      <div className="rounded-[16px] border border-[#eadfce] bg-[#faf7f2] px-6 py-8">
        <p className="text-[20px] font-semibold text-ink sm:text-[26px]">You are now on the {store}</p>
        <p className="mt-1 text-[14px] text-[#121212bf] sm:text-[15px]">Switch stores to explore the other edits.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {others.map((o) => (
            <Link key={o.href} href={o.href} className="inline-flex h-10 items-center rounded-full border border-ink px-5 text-[14px] text-ink hover:bg-ink hover:text-white">
              {o.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ActionPair({ shopHref }: { shopHref: string }) {
  return (
    <div className="container-x flex justify-center gap-3 pb-4">
      <Link href={shopHref} className="inline-flex h-11 items-center rounded-full bg-ink px-7 text-[14px] font-semibold text-white">
        Jewellery
      </Link>
      <Link href="/contact" className="inline-flex h-11 items-center rounded-full border border-ink px-7 text-[14px] font-semibold text-ink">
        Customise
      </Link>
    </div>
  );
}

export function KnowMore({ title, blocks }: { title: string; blocks: { heading: string; body: string }[] }) {
  return (
    <section className="container-x max-w-[860px] pb-16">
      <h2 className="mb-4 text-center text-[26px] font-semibold text-ink sm:text-[32px]">{title}</h2>
      <div className="divide-y divide-line rounded-[16px] border border-line bg-white">
        {blocks.map((b) => (
          <details key={b.heading} className="group px-5 py-4">
            <summary className="cursor-pointer list-none text-[17px] font-semibold text-ink sm:text-[18px]">{b.heading}</summary>
            <p className="mt-2 text-[15px] leading-relaxed text-[#121212bf]">{b.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
