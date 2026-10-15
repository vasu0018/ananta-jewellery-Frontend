"use client";

import { useRef, useState } from "react";
import { Expand } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Image = { id: string; url: string; alt: string };

/**
 * Product images: thumbnails + hover zoom on desktop, swipeable strip on mobile,
 * and a full-screen viewer on click/tap.
 */
export function Gallery({ images, name, compact, rating }: { images: Image[]; name: string; compact?: boolean; rating?: { avg: number; count: number } }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [viewer, setViewer] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [{ id: "placeholder", url: "", alt: name }];
  const current = list[Math.min(index, list.length - 1)];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const ratingChip =
    rating && rating.count > 0 ? (
      <span className="pointer-events-none absolute bottom-0 left-0 z-10 inline-flex items-center gap-1 rounded-tr-[14.4px] bg-[#f2f2f2] px-3 py-1 text-[14px] text-ink">
        {rating.avg.toFixed(1)} <span className="text-gold">★</span> <span className="text-[#121212a6]">| {rating.count}</span>
      </span>
    ) : null;

  const onStripScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className={cn("flex flex-col gap-3", !compact && "lg:rounded-[20px] lg:border lg:border-[#1212120d] lg:bg-white lg:p-[5px] lg:pb-3 lg:shadow-[-3px_3px_5px_rgb(227_227_227/0.5)]")}>
      {/* Desktop main image with hover zoom */}
      <div
        className={cn(
          "relative hidden flex-1 cursor-zoom-in overflow-hidden rounded-[15px] bg-[#f7f7f7]",
          compact ? "aspect-square sm:block" : "aspect-[4/5] lg:block",
        )}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setViewer(true)}
      >
        <Img
          src={current.url || null}
          alt={current.alt}
          fill
          preload={!compact}
          sizes="(min-width: 1024px) 50vw, 100vw"
          quality={90}
          className="object-cover transition-transform duration-200 ease-out"
          style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        {ratingChip}
        <span className="pointer-events-none absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm">
          <Expand className="size-4" />
        </span>
      </div>

      {/* Mobile swipe strip */}
      <div className={cn("relative", compact ? "sm:hidden" : "lg:hidden")}>
        {ratingChip}
        <div ref={stripRef} onScroll={onStripScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[16px]">
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setIndex(i);
                setViewer(true);
              }}
              className="relative aspect-square w-full shrink-0 snap-center bg-cream"
              aria-label={`View image ${i + 1}`}
            >
              <Img src={img.url || null} alt={img.alt} fill preload={i === 0 && !compact} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {list.map((img, i) => (
              <span key={img.id} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-rose-dark" : "w-1.5 bg-ink/25")} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className={cn("no-scrollbar hidden gap-2.5 overflow-x-auto p-0.5", compact ? "sm:flex" : "lg:flex lg:justify-center")}>
          {list.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              onMouseEnter={() => setIndex(i)}
              className={cn(
                "relative size-[70px] shrink-0 overflow-hidden rounded-[8px] bg-cream transition",
                i === index ? "ring-2 ring-rose" : "opacity-75 ring-1 ring-line hover:opacity-100",
              )}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              <Img src={img.url || null} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <Sheet open={viewer} onOpenChange={setViewer} side="center" title={name} hideTitle className="max-w-4xl" bodyClassName="p-3 sm:p-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream">
          <Img src={current.url || null} alt={current.alt} fill sizes="(min-width: 1024px) 900px, 100vw" quality={90} className="object-contain" />
        </div>
        {list.length > 1 && (
          <div className="no-scrollbar mt-3 flex justify-center gap-2 overflow-x-auto">
            {list.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn("relative size-16 shrink-0 overflow-hidden rounded-lg bg-cream", i === index ? "ring-2 ring-ink" : "opacity-60")}
                aria-label={`Show image ${i + 1}`}
              >
                <Img src={img.url || null} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}
