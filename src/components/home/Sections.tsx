import Link from "next/link";
import { BadgeCheck, Gem, Lock, RefreshCcw, Sparkles, Truck } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { Countdown } from "@/components/product/Countdown";
import { Scroller } from "./Scroller";
import { SWATCH } from "@/lib/swatch";
import { cn } from "@/lib/utils";
import type { Banner, Category, Collection, Offer, ProductCard } from "@/lib/types";

export function Title({ children, sub, className }: { children: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 text-center sm:mb-7", className)}>
      <h2 className="section-title">{children}</h2>
      {sub && <p className="mt-1.5 text-[14px] text-[#121212bf] sm:text-[15px]">{sub}</p>}
    </div>
  );
}

export function ViewMore({ href, label = "View More" }: { href: string; label?: string }) {
  return (
    <div className="mt-7 text-center">
      <Link href={href} className="inline-flex h-10 items-center rounded-[10px] border border-[#373737] bg-white px-10 text-[15px] text-ink transition hover:bg-cream">
        {label}
      </Link>
    </div>
  );
}

function offerTile(o: Offer): { top: string; big: string; bottom: string; label: string } | null {
  if (o.type === "BUY_X_GET_Y") {
    const m = /BUY(\d+)GET(\d+)/i.exec(o.code);
    return m ? { top: `BUY ${m[1]}`, big: `GET ${m[2]}`, bottom: "FREE", label: `Buy ${m[1]} Get ${m[2]}` } : null;
  }
  if (o.type === "FIXED" && o.value) return { top: "FLAT", big: `₹${o.value}`, bottom: "OFF", label: `Flat ₹${o.value} Off` };
  if (o.type === "PERCENTAGE" && o.value) return { top: "FLAT", big: `${o.value}%`, bottom: "OFF", label: `Flat ${o.value}% Off` };
  return null;
}

/** Rounded square tiles: live coupon offers first, then the product types. */
export function CategoryTiles({ categories, offers }: { categories: Category[]; offers: Offer[] }) {
  const deals = offers.filter((o) => !o.firstOrderOnly).flatMap((o) => {
    const t = offerTile(o);
    return t ? [{ ...t, code: o.code }] : [];
  });
  const tile = "w-[96px] shrink-0 snap-start sm:w-[130px] lg:w-[164px]";
  const box =
    "relative isolate grid aspect-square place-items-center overflow-hidden rounded-[16px] bg-[radial-gradient(circle_at_50%_30%,#fdeef1_0%,#f8cfd8_55%,#f1aebe_100%)] transition group-hover:shadow-soft sm:rounded-[22px]";
  const label = "mt-2 block text-center text-[14px] tracking-[0.72px] text-ink sm:mt-3 sm:text-[18px] lg:text-[21.6px]";
  const outlined = "[-webkit-text-stroke:3px_#fff] [paint-order:stroke_fill]";
  return (
    <Scroller
      trackClassName="gap-3 sm:gap-4"
      persistentArrows
      arrowClassName="top-[calc(50%-14px)] size-9 text-ink-soft lg:size-10"
    >
      {deals.slice(0, 2).map((d) => (
        <Link key={d.code} href="/shop?sort=popular" title={`Use code ${d.code}`} className={cn("group", tile)}>
          <span className={box}>
            <span className="pointer-events-none absolute -bottom-1/4 left-1/2 h-1/2 w-[120%] -translate-x-1/2 rounded-[50%] bg-[#eb9fb2]/70" />
            <span className="relative -rotate-6 text-center font-black italic leading-[0.92] text-[#a3123a]">
              <span className={cn("block text-[16px] sm:text-[24px] lg:text-[30px]", outlined)}>{d.top}</span>
              <span className={cn("block text-[22px] sm:text-[32px] lg:text-[40px]", outlined)}>{d.big}</span>
              <span className="mx-auto mt-1 block w-fit -skew-x-6 rounded-[3px] bg-[#e11d48] px-2 py-0.5 text-[12px] tracking-[0.06em] text-white shadow-[0_2px_0_#7f1030] sm:text-[17px] lg:px-3 lg:text-[21px]">
                {d.bottom}
              </span>
            </span>
          </span>
          <span className={label}>{d.label}</span>
        </Link>
      ))}
      {categories.map((c) => (
        <Link key={c.id} href={`/category/${c.slug}`} className={cn("group", tile)}>
          <span className={box}>
            <Img src={c.image} alt={c.name} fill sizes="164px" className="object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />
          </span>
          <span className={label}>{c.name}</span>
        </Link>
      ))}
    </Scroller>
  );
}

/** Four peach "why us" cards under the category tiles. */
export function TrustBadges({ freeShippingAbove }: { freeShippingAbove: number }) {
  const badges = [
    { icon: BadgeCheck, bold: "925 Fine", rest: "Silver" },
    { icon: Truck, bold: "Free Shipping", rest: freeShippingAbove > 0 ? `above ₹${freeShippingAbove.toLocaleString("en-IN")}` : "on all orders" },
    { icon: Gem, bold: "Lifetime", rest: "Plating" },
    { icon: RefreshCcw, bold: "Easy 30", rest: "Days Return", inline: true },
  ];
  return (
    <section className="container-x grid grid-cols-2 gap-3 py-5 sm:gap-5 lg:grid-cols-4 lg:gap-12 lg:py-8">
      {badges.map(({ icon: Icon, bold, rest, inline }) => (
        <div key={bold} className="flex items-center gap-3 rounded-[12px] bg-[linear-gradient(90deg,#fdf3ec_0%,#fde6d4_100%)] p-2.5 sm:gap-4 sm:p-3 lg:p-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-white text-[#a8456b] shadow-[0_1px_4px_rgb(214_140_110/0.18)] sm:size-[62px] lg:size-[80px]">
            <Icon className="size-6 sm:size-8 lg:size-10" strokeWidth={1.3} />
          </span>
          <p className="text-[13px] leading-tight text-ink sm:text-[19px] lg:text-[22px]">
            <span className="font-bold">{bold}</span>
            {inline ? " " : <br />}
            {rest}
          </p>
        </div>
      ))}
    </section>
  );
}

const IST_DAY = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** Labels for the upcoming deal days: "Tomorrow", then "17 Oct", "18 Oct"… */
function upcomingDays(count: number, from: number) {
  return Array.from({ length: count }, (_, i) => (i === 0 ? "Tomorrow" : IST_DAY.format(new Date(from + (i + 1) * 86_400_000))));
}

/**
 * "Unlock daily offers": a sale banner plus a "Deal of the day" strip —
 * yesterday's deal (expired), today's deal and the locked days ahead.
 */
export function DailyOffers({ sale, now }: { sale: { name: string; description: string | null; endsAt: string; products: ProductCard[] }; now: number }) {
  const [today, expired, ...rest] = sale.products;
  if (!today) return null;
  const locked = rest.slice(0, 5);
  const days = upcomingDays(locked.length, now);
  const maxOff = Math.max(0, ...sale.products.map((p) => p.discountPct ?? 0));
  const showcase = sale.products.filter((p) => p.image).slice(0, 3);
  const card = "relative flex w-[140px] shrink-0 snap-start flex-col overflow-hidden rounded-[16px] sm:w-[170px] lg:w-auto lg:min-w-0 lg:flex-1";
  const art = "relative block aspect-square overflow-hidden";
  const btn = "mt-auto flex h-8 items-center justify-center rounded-full text-[12px] font-black uppercase tracking-[0.06em] sm:text-[13px]";
  const deal = (pct: number | null | undefined, on: string) => (
    <>
      <span className="text-[12px]">FLAT </span>
      <span className="text-[20px] sm:text-[24px]">{pct ?? 0}%</span>
      <span className="text-[12px]"> OFF</span>
      <span className="block truncate text-[11px] font-bold sm:text-[12px]">on {on}</span>
    </>
  );
  return (
    <section className="container-x py-6 sm:py-8">
      <h2 className="mb-4 flex items-center gap-2 text-[20px] font-black uppercase tracking-[0.02em] text-[#d6246e] sm:text-[28px]">
        <Sparkles className="size-5 fill-current sm:size-6" /> Unlock Daily Offers <Sparkles className="size-5 fill-current sm:size-6" />
      </h2>

      <Link
        href="/shop?flashSale=1"
        className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-[18px] bg-[linear-gradient(90deg,#d93a76_0%,#f0679a_48%,#d42f6d_100%)] px-5 py-5 text-white sm:flex-row sm:justify-between sm:gap-6 sm:px-10 sm:py-0 lg:h-[160px]"
      >
        <span aria-hidden className="pointer-events-none absolute -left-12 -top-20 size-52 rounded-full bg-white/10" />
        <span aria-hidden className="pointer-events-none absolute -bottom-24 left-[42%] size-64 rounded-full bg-white/10" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-[11px] font-black uppercase text-[#d6246e] sm:text-[12px]">
            Ends in <Countdown endsAt={sale.endsAt} compact />
          </span>
          {maxOff > 0 && (
            <p className="mt-1 font-black leading-none">
              <span className="align-top text-[20px] sm:text-[28px]">Flat </span>
              <span className="text-[44px] sm:text-[64px]">{maxOff}%</span>
              <span className="text-[20px] sm:text-[28px]">OFF</span>
            </p>
          )}
        </div>
        {showcase.length > 0 && (
          <div className="relative hidden items-center lg:flex">
            {showcase.map((p, i) => (
              <span
                key={p.id}
                className={cn(
                  "relative size-[100px] shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_22px_-8px_rgb(110_8_45/0.6)] transition duration-500",
                  i > 0 && "-ml-6",
                  i === 1 && "z-10 size-[124px] group-hover:scale-105",
                )}
              >
                <Img src={p.image} alt="" fill sizes="124px" className="object-cover" />
              </span>
            ))}
          </div>
        )}
        <div className="relative text-center sm:text-right">
          <p className="font-serif text-[26px] italic leading-tight sm:text-[40px]">{sale.name}</p>
          {sale.description && <p className="text-[13px] text-white/90 sm:text-[14px]">{sale.description}</p>}
          <span className="mt-2 inline-flex h-8 items-center rounded-full bg-[#ffd86b] px-5 text-[12px] font-black uppercase tracking-[0.08em] text-[#8c2241]">Shop now</span>
        </div>
      </Link>

      <div className="mt-6 flex items-baseline gap-2">
        <h3 className="text-[22px] font-black italic text-[#c2185b] sm:text-[28px]">Deal of the day</h3>
        <span className="text-[12px] font-bold text-[#c2185b] sm:text-[13px]">Daily at 11 AM!</span>
      </div>
      <Scroller className="mt-3" trackClassName="items-stretch gap-3 px-1 py-2 sm:gap-4 lg:gap-5">
        {expired && (
          <div className={cn(card, "bg-[#f1e4e8] p-1.5")}>
            <span className={cn(art, "rounded-[12px] bg-white")}>
              <Img src={expired.image} alt="" fill sizes="(min-width: 1024px) 14vw, 170px" className="object-cover opacity-60 grayscale" />
              <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#7d5b66] px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white sm:text-[11px]">
                Expired
              </span>
            </span>
            <p className="px-1 pb-2.5 pt-2.5 text-center font-black leading-tight text-[#8d6b76]">{deal(expired.discountPct, expired.category?.name ?? "Bestsellers")}</p>
            <span className={cn(btn, "bg-white/70 text-[#8d6b76]/70")}>Expired</span>
          </div>
        )}

        <Link
          href={`/products/${today.slug}`}
          className={cn(
            card,
            "group bg-[linear-gradient(180deg,#f06a99_0%,#c2185b_100%)] p-1.5 text-white shadow-[0_0_0_3px_#ffc2d4,0_12px_26px_-10px_rgb(194_24_91/0.7)]",
          )}
        >
          <span className={cn(art, "rounded-[12px] bg-white")}>
            <Img src={today.image} alt={today.name} fill sizes="(min-width: 1024px) 14vw, 170px" className="object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] sm:text-[11px]">
              Today&apos;s deal
            </span>
          </span>
          <p className="px-1 pb-2.5 pt-2.5 text-center font-black leading-tight">{deal(today.discountPct, today.category?.name ?? today.name)}</p>
          <span className={cn(btn, "bg-white text-[#c2185b] transition group-hover:bg-[#ffd86b]")}>Steal</span>
        </Link>

        {locked.map((p, i) => (
          <div key={p.id} className={cn(card, "bg-[linear-gradient(180deg,#fde4ec_0%,#efe3f7_100%)] p-1.5")}>
            <span className={cn(art, "rounded-[12px] bg-[#fbe3ea]")}>
              <Img src={p.image} alt="" fill sizes="80px" className="scale-110 object-cover opacity-70 blur-[10px]" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-12 place-items-center rounded-full bg-[linear-gradient(180deg,#ffd86b,#f0a12b)] text-white shadow-[0_6px_14px_-4px_rgb(176_100_10/0.6)] ring-4 ring-white/70 sm:size-14">
                  <Lock className="size-5 sm:size-6" strokeWidth={2.4} />
                </span>
              </span>
            </span>
            <p className="px-1 pb-2.5 pt-2.5 text-center leading-tight text-[#c2185b]">
              <span className="block text-[11px] font-bold sm:text-[12px]">Unlocks</span>
              <span className="block text-[18px] font-black sm:text-[20px]">{days[i]}</span>
              <span className="block text-[11px] font-bold sm:text-[12px]">at 11:00 AM</span>
            </p>
            <span className={cn(btn, "bg-white/80 text-[#c2185b]/45")}>Steal</span>
          </div>
        ))}
      </Scroller>
    </section>
  );
}

/** Two pill-shaped promo banners that run to the screen edges. */
export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="grid gap-3 py-5 sm:grid-cols-2 sm:gap-8 sm:py-8">
      {banners.slice(0, 2).map((b, i) => {
        const flip = i % 2 === 1;
        return (
          <Link
            key={b.id}
            href={b.link ?? "/shop"}
            className={cn(
              "group relative flex h-[150px] items-center overflow-hidden sm:h-[190px] lg:h-[240px]",
              flip
                ? "flex-row-reverse rounded-l-full bg-[linear-gradient(270deg,#fff_0%,#fbdce3_35%,#f3b6c4_100%)]"
                : "rounded-r-full bg-[linear-gradient(90deg,#fff_0%,#fbdce3_35%,#f3b6c4_100%)]",
            )}
          >
            <div className={cn("relative z-10 flex w-[55%] flex-col items-center px-4 text-center", flip ? "pr-4" : "pl-4")}>
              <span className="inline-flex h-9 items-center rounded-full bg-maroon-grad px-5 font-serif text-[13px] uppercase tracking-[0.14em] text-white shadow-md sm:h-11 sm:px-7 sm:text-[17px]">
                {b.title}
              </span>
              {b.subtitle && <p className="mt-2 line-clamp-2 text-[12px] text-rose-dark sm:text-[14px]">{b.subtitle}</p>}
            </div>
            <div className={cn("absolute inset-y-0 w-[48%] overflow-hidden", flip ? "left-0 rounded-l-full" : "right-0 rounded-r-full")}>
              <Img src={b.image} alt="" fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
          </Link>
        );
      })}
    </section>
  );
}

const WORLD_LABEL: Partial<Record<Collection["type"], string>> = {
  CELEBRITY: "Celebrity Edit",
  CURATED: "Signature Collection",
  OCCASION: "Occasion Edit",
};

/** "The World of …": a peach title band over two rows of portrait collection cards. */
export function WorldOf({ storeName, collections }: { storeName: string; collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="bg-[#fff5f3] pb-8 sm:pb-12 lg:pb-14">
      <div className="container-x">
        <div className="mb-5 rounded-b-[14px] bg-[#fdebe5] py-4 text-center sm:mb-7 sm:py-6 lg:py-8">
          <h2 className="section-title">The World of {storeName.split(" ")[0]}</h2>
        </div>
        <Scroller
          arrowClassName="size-9 text-ink-soft"
          trackClassName="grid grid-flow-col grid-rows-2 auto-cols-[44%] gap-x-3 gap-y-3 sm:auto-cols-[30%] sm:gap-x-5 sm:gap-y-5 lg:auto-cols-[calc((100%-96px)/4)] lg:gap-x-8"
        >
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group relative block aspect-[268/330] snap-start overflow-hidden rounded-[14px] bg-cream shadow-[0_6px_18px_-10px_rgb(60_20_30/0.45)] sm:rounded-[18px]"
            >
              <Img src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 24vw, (min-width: 640px) 30vw, 44vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-3.5 pt-16 text-center sm:pb-5 sm:pt-24">
                <p className="text-[14px] font-bold leading-tight tracking-[0.02em] text-white sm:text-[18px] lg:text-[21px]">{c.name}</p>
                <p className="mt-1 text-[11px] italic tracking-[0.03em] text-white/85 sm:text-[13px] lg:text-[15px]">{WORLD_LABEL[c.type] ?? "Collection"}</p>
              </div>
            </Link>
          ))}
        </Scroller>
      </div>
    </section>
  );
}

/** "Gifting Made Easy": budget cards that link to the gifting collections. */
export function GiftingPrices({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="container-x pb-4 pt-9 sm:pt-12">
      <Title>Gifting Made Easy</Title>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
        {collections.slice(0, 3).map((c) => {
          const m = /under\s+(₹[\d,]+)/i.exec(c.name);
          return (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className={cn(
                "group relative grid h-[96px] place-items-center overflow-hidden rounded-[14px] text-center text-white shadow-[0_6px_16px_-8px_rgb(140_34_65/0.5)] transition hover:-translate-y-0.5 sm:h-[150px] sm:place-items-center sm:justify-start sm:rounded-[20px] sm:px-7 sm:text-left lg:h-[200px] lg:px-9",
                m ? "bg-[linear-gradient(180deg,#f6c1cd_0%,#e58aa1_100%)]" : "bg-[linear-gradient(135deg,#c27aa8_0%,#8e4a87_100%)]",
              )}
            >
              {c.image && (
                <>
                  <span className="absolute inset-0 sm:left-[34%] sm:[mask-image:linear-gradient(90deg,transparent,#000_30%)]">
                    <Img src={c.image} alt="" fill sizes="(min-width: 640px) 22vw, 34vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 sm:bg-transparent",
                      m
                        ? "bg-[#e07c97]/70 sm:bg-[linear-gradient(90deg,#e58aa1_0%,#e58aa1_36%,rgb(229_138_161/0.75)_52%,rgb(229_138_161/0)_80%)]"
                        : "bg-[#8e4a87]/70 sm:bg-[linear-gradient(90deg,#8e4a87_0%,#8e4a87_36%,rgb(142_74_135/0.75)_52%,rgb(142_74_135/0)_80%)]",
                    )}
                  />
                </>
              )}
              {!m && (
                <span className="absolute -right-6 top-3 z-10 rotate-45 bg-[#e0262f] px-8 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white sm:top-5 sm:text-[11px]" aria-hidden>
                  Gift
                </span>
              )}
              <span className="relative leading-none [text-shadow:0_2px_6px_rgb(120_20_60/0.35)]">
                {m ? (
                  <>
                    <span className="block text-[16px] font-bold sm:text-[26px] lg:text-[34px]">Under</span>
                    <span className="mt-1 block text-[24px] font-black sm:text-[42px] lg:text-[56px]">{m[1]}</span>
                  </>
                ) : (
                  <>
                    <span className="block text-[14px] font-bold sm:text-[24px] lg:text-[30px]">{c.name.replace(/\s+gifts?$/i, "")}</span>
                    <span className="mt-1 block text-[22px] font-black tracking-[0.06em] sm:text-[40px] lg:text-[52px]">GIFTS</span>
                  </>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** Two wide side-by-side banners. */
export function WideBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="container-x grid gap-3 py-6 sm:grid-cols-2 sm:gap-5">
      {banners.slice(0, 2).map((b) => {
        const lines = b.title.split("·").map((s) => s.trim());
        return (
          <Link key={b.id} href={b.link ?? "/shop"} className="group relative block aspect-[3/1] overflow-hidden rounded-[10px] bg-cream">
            <Img src={b.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-dark/85 via-rose-dark/45 to-transparent" />
            <div className="relative flex h-full max-w-[65%] flex-col justify-center p-4 text-white sm:p-6">
              {lines.length > 1 ? (
                <ul className="space-y-0.5 text-[15px] font-bold sm:text-[19px]">
                  {lines.map((l) => (
                    <li key={l}>✦ {l}</li>
                  ))}
                </ul>
              ) : (
                <>
                  <h3 className="font-serif text-[20px] uppercase leading-tight tracking-[0.04em] sm:text-[28px]">{b.title}</h3>
                  {b.subtitle && <p className="mt-1 text-[12.5px] text-white/90 sm:text-[14px]">{b.subtitle}</p>}
                </>
              )}
              <span className="mt-2.5 inline-flex h-8 w-fit items-center rounded-full bg-white px-4 text-[12px] font-bold text-rose-dark">{b.ctaLabel || "Explore more"}</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

/** Banner-style header used by the "Most Gifted" and "Gifts for Him" product sections. */
export function OfferHeader({
  title,
  sub,
  tag,
  dark,
  images = [],
}: {
  title: string;
  sub?: string;
  tag?: string;
  dark?: boolean;
  /** Up to two photos: the first fades in from the right edge, the second from the left (desktop only). */
  images?: (string | null | undefined)[];
}) {
  const [right, left] = images;
  return (
    <div
      className={cn(
        "relative mb-6 rounded-[10px] px-4 py-4 text-center sm:mb-8 sm:py-6",
        right && "py-6 sm:py-9 lg:py-11",
        dark ? "bg-[linear-gradient(90deg,#5c1027_0%,#8c2241_50%,#5c1027_100%)] text-white" : "bg-[linear-gradient(90deg,#fde3e8_0%,#fff5f7_50%,#fde3e8_100%)] text-rose-dark",
      )}
    >
      {right && (
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[10px]">
          <span className="absolute inset-y-0 right-0 w-[42%] [mask-image:linear-gradient(90deg,transparent,#000_50%)] sm:w-[34%]">
            <Img src={right} alt="" fill sizes="(min-width: 640px) 420px, 42vw" className="object-cover" />
          </span>
          {left && (
            <span className="absolute inset-y-0 left-0 w-[34%] [mask-image:linear-gradient(270deg,transparent,#000_50%)] max-sm:hidden">
              <Img src={left} alt="" fill sizes="420px" className="object-cover" />
            </span>
          )}
        </div>
      )}
      {tag && (
        <span className="absolute -top-3 left-3 z-10 rounded-[4px] bg-[linear-gradient(90deg,#f6c76b,#e3a33a)] px-3 py-0.5 text-[11px] font-black text-ink shadow-sm sm:left-5 sm:text-[12px]">
          {tag}
        </span>
      )}
      <div className="relative">
        <h2 className="font-serif text-[26px] uppercase leading-none tracking-[0.08em] sm:text-[40px]">{title}</h2>
        {sub && <p className={cn("mt-1.5 text-[12px] sm:text-[14px]", dark ? "text-white/80" : "text-[#121212bf]")}>{sub}</p>}
      </div>
    </div>
  );
}

function LaunchSide({ product }: { product: ProductCard }) {
  return (
    <Link href={`/products/${product.slug}`} className="group relative hidden h-full min-h-[220px] overflow-hidden rounded-[18px] bg-white shadow-[0_10px_24px_-16px_rgb(120_40_60/0.7)] xl:block">
      <Img src={product.image} alt={product.name} fill sizes="240px" className="object-cover transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-14 text-[13px] font-semibold leading-snug text-white">
        {product.name}
      </span>
    </Link>
  );
}

function usablePhoto(src: string | null | undefined) {
  return !!src && !/example\.com/i.test(src);
}

/** "New Launch": peach band, category tiles in the middle, a product photo on each side. */
export function NewLaunch({ products }: { products: ProductCard[] }) {
  const seen = new Set<string>();
  const tiles = products.filter((p) => {
    if (!p.category || seen.has(p.category.slug) || !usablePhoto(p.image)) return false;
    seen.add(p.category.slug);
    return true;
  });
  if (!tiles.length) return null;
  const photos = products.filter((p) => usablePhoto(p.image));
  const left = photos[0];
  const right = photos.length > 1 ? photos[photos.length - 1] : null;
  const maxOff = Math.max(0, ...products.map((p) => p.discountPct ?? 0));
  return (
    <section className="my-6 bg-[linear-gradient(180deg,#f8e6de_0%,#fbeee9_100%)] sm:my-8">
      <div className={cn("container-x grid items-stretch gap-5 py-5 sm:py-6", left && right && "xl:grid-cols-[200px_minmax(0,1fr)_200px] xl:gap-6")}>
        {left && right && <LaunchSide product={left} />}
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-4 flex items-center justify-center gap-4 sm:mb-5 sm:gap-6">
            <h2 className="font-serif text-[30px] font-bold uppercase leading-none tracking-[0.02em] text-rose-dark sm:text-[44px]">New Launch</h2>
            <div className="text-left">
              {maxOff > 0 && <p className="text-[13px] font-bold text-ink sm:text-[17px]">Upto {maxOff}% Off</p>}
              <Link href="/shop?newArrival=1&sort=newest" className="mt-0.5 inline-flex h-6 items-center rounded-full bg-[#c96a7f] px-4 text-[12px] font-bold text-white sm:h-7 sm:text-[13px]">
                Explore
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 xl:grid-cols-9">
            {tiles.map((p) => (
              <Link key={p.category!.slug} href={`/category/${p.category!.slug}?newArrival=1`} className="group min-w-0">
                <span className="relative block aspect-square overflow-hidden rounded-[14px] bg-white">
                  <Img src={p.image} alt={p.category!.name} fill sizes="140px" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-[#e9718b] px-1.5 py-px text-[10px] font-bold text-white">
                    <Sparkles className="size-2.5 fill-current" /> New
                  </span>
                </span>
                <span className="mt-1.5 block text-balance text-center text-[12px] leading-tight text-ink 2xl:text-[14px]">{p.category!.name}</span>
              </Link>
            ))}
          </div>
        </div>
        {left && right && <LaunchSide product={right} />}
      </div>
    </section>
  );
}

const METAL_CHIP: Record<string, string> = {
  Silver: "Pure 925 Silver",
  Gold: "18K Gold Plated",
  "Rose Gold": "Rose Gold Plated",
  Oxidised: "Oxidised Silver",
};

/** "Shop by Colour": pink landscape cards with a metal chip on top and a swatch on the bottom edge. */
export function ColourCards({ collections, products }: { collections: Collection[]; products: ProductCard[] }) {
  if (!collections.length) return null;
  return (
    <section className="container-x py-8 sm:py-10">
      <Title>Shop by Colour</Title>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
        {collections.map((c) => {
          const p = products.find((x) => x.colour === c.name);
          const label = METAL_CHIP[c.name] ?? c.name;
          return (
            <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
              <span className="relative block rounded-[16px] bg-[linear-gradient(180deg,#f9d5dd_0%,#f0b2c0_100%)] p-2.5 pt-7 sm:p-3 sm:pt-8">
                <span className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-[#5a5a5a] shadow-sm sm:text-[11.5px]">
                  {label}
                </span>
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[12px] bg-white">
                  <Img src={p?.image ?? c.image} alt={c.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </span>
                <span
                  className="absolute -bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full border-[3px] border-white shadow-md sm:size-9"
                  style={{ background: SWATCH[c.name] ?? "#e8e2da" }}
                />
              </span>
              <span className="mt-5 block text-center text-[14px] text-ink sm:text-[17px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** "Shop by Bond": portrait cards with the relationship name on a pink fade. */
export function BondPortraits({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="container-x py-8 sm:py-10">
      <Title>Shop by Bond</Title>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
        {collections.map((c) => (
          <Link key={c.id} href={`/collections/${c.slug}`} className="group relative block overflow-hidden rounded-[12px] bg-[#ffd3dc]">
            <span className="relative block aspect-[6/7] overflow-hidden">
              <Img src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#e58aa1] via-[#e58aa1]/80 to-transparent pb-2 pt-8 text-center text-[15px] font-bold text-white sm:text-[17px]">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Collapsible brand blurb that sits right on top of the footer. */
export function KnowMore({ storeName, paragraphs }: { storeName: string; paragraphs: string[] }) {
  return (
    <section className="-mb-12 mt-8">
      <details className="group bg-[#fde1e7]">
        <summary className="cursor-pointer list-none py-2.5 text-center text-[13px] text-ink sm:text-[14px] [&::-webkit-details-marker]:hidden">
          Know More about {storeName}
        </summary>
        <div className="container-x space-y-3 pb-5 text-[14px] leading-6 text-[#121212bf]">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </details>
    </section>
  );
}
