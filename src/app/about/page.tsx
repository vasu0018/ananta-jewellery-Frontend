import type { Metadata } from "next";
import Link from "next/link";
import { Gem, HandHeart, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { Img } from "@/components/ui/Img";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/settings";
import { getJsonSafe } from "@/lib/server-api";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our story",
  description: "Ananta Jewellery makes certified 925 silver and lab-grown diamond jewellery, designed in India to be worn every day and treasured forever.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "Certified 925 silver", text: "Every piece is hallmarked sterling silver — hypoallergenic, nickel-free and made to last." },
  { icon: Gem, title: "Lab-grown diamonds", text: "Real diamonds with the same fire and brilliance, certified by IGI and kinder to the planet." },
  { icon: Sparkles, title: "Lifetime plating", text: "Send any plated piece back, any time, and we'll restore its shine for free." },
  { icon: HandHeart, title: "Made by artisans", text: "Designed in our studio and finished by hand by skilled karigars across India." },
  { icon: Leaf, title: "Thoughtful packaging", text: "Recyclable boxes and reusable anti-tarnish pouches — no single-use plastic." },
  { icon: Truck, title: "Easy, honest service", text: "Free shipping, 30-day returns and real people on WhatsApp when you need help." },
];

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getJsonSafe<Category[]>("/catalog/categories", [], { revalidate: 300, tags: ["categories"] }),
  ]);
  const images = categories.filter((c) => c.image).slice(0, 4);

  return (
    <>
      <div className="container-x pt-4">
        <Breadcrumbs items={[{ label: "Our story" }]} />
      </div>

      <section className="container-x grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <p className="eyebrow mb-3">Our story</p>
          <h1 className="font-display text-4xl font-medium leading-tight text-ink sm:text-6xl">Jewellery that celebrates every you.</h1>
          <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink-soft">
            <p>
              {settings.store.name} began with a simple belief: fine jewellery shouldn&apos;t be saved for special occasions. It should be part of your every day — at
              work, at weddings, on lazy Sundays — and it should feel as good as it looks.
            </p>
            <p>
              So we set out to make pieces in certified 925 silver and lab-grown diamonds that are beautiful, honest and made to last, at prices that let you build a
              collection rather than wait for one.
            </p>
            <p>
              Every design starts in our studio{settings.store.city ? ` in ${settings.store.city}` : ""} and is finished by hand, checked twice and packed with care.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/shop">Shop the collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {images.map((c, i) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className={`group relative overflow-hidden rounded-3xl bg-cream ${i % 3 === 0 ? "aspect-[4/5]" : "aspect-square"} ${i === 1 ? "mt-10" : ""}`}
              >
                <Img src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="container-x">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-2">What we stand for</p>
            <h2 className="section-title">Made with care, made to last</h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-3xl bg-white p-6">
                <span className="grid size-11 place-items-center rounded-full bg-blush text-rose">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-[17px] font-medium text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-x py-16 text-center sm:py-20">
        <h2 className="section-title mx-auto max-w-2xl">Find a piece that feels like you</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted">From everyday studs to statement necklaces — explore new arrivals or let us help you pick the perfect gift.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/shop?newArrival=1&sort=newest">New arrivals</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/gifting">The gifting edit</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
