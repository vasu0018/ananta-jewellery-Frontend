"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";
import type { Banner } from "@/lib/types";

/** Full-width banner slider with dots underneath; autoplay pauses on hover/focus. */
export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count, paused]);

  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="group relative h-[300px] overflow-hidden bg-cream sm:h-[400px] lg:h-[500px] xl:h-[540px]">
        {banners.map((b, i) => {
          const active = i === index;
          return (
            <Link
              key={b.id}
              href={b.link ?? "/shop"}
              tabIndex={active ? 0 : -1}
              className={cn("absolute inset-0 block transition-opacity duration-700", active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
              aria-hidden={!active}
              aria-roledescription="slide"
              aria-label={`${b.title} — ${i + 1} of ${count}`}
            >
              <Img src={b.image} alt="" fill preload={i === 0} sizes="100vw" quality={90} className="object-cover object-[72%_center]" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent sm:from-white/80 sm:via-white/25" />
              <div className="container-x relative flex h-full items-center">
                <div className="max-w-[62%] sm:max-w-md lg:max-w-lg">
                  {b.eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose sm:mb-2 sm:text-[13px]">{b.eyebrow}</p>}
                  <h2 className="text-[30px] font-bold leading-[1.1] text-rose-dark sm:text-[44px] lg:text-[58px]" style={{ color: b.textColor ?? undefined }}>
                    {b.title}
                  </h2>
                  {b.subtitle && <p className="mt-2 line-clamp-2 text-[13px] text-[#121212bf] sm:mt-3 sm:text-[17px] lg:text-[19px]">{b.subtitle}</p>}
                  <span className="mt-3 inline-flex h-8 items-center rounded-full border border-rose-dark px-4 text-[12px] font-bold uppercase tracking-[0.08em] text-rose-dark transition hover:bg-rose-dark hover:text-white sm:mt-6 sm:h-11 sm:px-7 sm:text-[14px]">
                    {b.ctaLabel || "Shop now"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition group-hover:opacity-100 lg:grid"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition group-hover:opacity-100 lg:grid"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 py-3">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => go(i)}
              className={cn("h-2 rounded-full transition-all", i === index ? "w-5 bg-rose-dark" : "w-2 bg-[#d6d6d6] hover:bg-[#b5b5b5]")}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
