"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sideways-scrolling row with round arrow buttons on desktop. */
export function Scroller({
  children,
  className,
  trackClassName,
  arrowClassName,
  persistentArrows = false,
}: {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
  arrowClassName?: string;
  /** Keep both arrows on screen (dimmed at the ends) instead of hiding them. */
  persistentArrows?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.75, behavior: "smooth" });

  const arrow = cn(
    "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgb(0_0_0/0.15)] transition hover:scale-105 lg:grid",
    persistentArrows ? "disabled:cursor-default disabled:opacity-60 disabled:hover:scale-100" : "disabled:opacity-0",
    arrowClassName,
  );
  return (
    <div className={cn("relative", className)}>
      <div ref={ref} onScroll={update} className={cn("no-scrollbar flex snap-x overflow-x-auto", trackClassName)}>
        {children}
      </div>
      <button type="button" onClick={() => scroll(-1)} disabled={edges.start} className={cn(arrow, "-left-4")} aria-label="Scroll left">
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" onClick={() => scroll(1)} disabled={edges.end} className={cn(arrow, "-right-4")} aria-label="Scroll right">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
