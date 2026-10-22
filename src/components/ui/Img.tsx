"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Gem } from "lucide-react";
import { cn, media } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string | null | undefined; alt: string };

/** Prefer same-origin `/uploads/...` so LAN IP browsing doesn't trip next/image host checks. */
function imageSrc(url: string) {
  try {
    const u = new URL(url, "http://local.invalid");
    if (u.pathname.startsWith("/uploads/")) return `${u.pathname}${u.search}`;
  } catch {
    /* keep absolute */
  }
  return url;
}

/** next/image throws if the host is not in next.config. Only optimize same-origin paths. */
function canOptimize(url: string) {
  return !/^(https?:)?\/\//i.test(url);
}

function Placeholder({ alt, className }: { alt: string; className?: string }) {
  return (
    <div className={cn("grid size-full place-items-center bg-cream text-gold-soft", className)} role="img" aria-label={alt}>
      <Gem className="size-1/4 max-h-12 max-w-12" strokeWidth={1.2} />
    </div>
  );
}

/** `next/image` for API media paths, with a soft placeholder when the image is missing or the host is unknown. */
export function Img({ src, alt, className, fill, ...props }: Props) {
  const raw = media(src);
  const url = raw ? imageSrc(raw) : "";
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [url]);

  if (!url || failed) return <Placeholder alt={alt} className={className} />;

  if (!canOptimize(url)) {
    return (
      // External hosts (for example a pasted example.com URL) must not go through next/image — that throws and blanks the page.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={imgRef}
        src={url}
        alt={alt}
        className={cn(fill && "absolute inset-0 size-full", className)}
        onError={() => setFailed(true)}
      />
    );
  }

  return <Image src={url} alt={alt} className={className} fill={fill} {...props} onError={() => setFailed(true)} />;
}
