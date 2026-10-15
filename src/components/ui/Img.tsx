import Image, { type ImageProps } from "next/image";
import { Gem } from "lucide-react";
import { cn, media } from "@/lib/utils";

type Props = Omit<ImageProps, "src" | "alt"> & { src: string | null | undefined; alt: string };

/** `next/image` for API media paths, with a soft placeholder when the image is missing. */
export function Img({ src, alt, className, ...props }: Props) {
  const url = media(src);
  if (!url) {
    return (
      <div className={cn("grid size-full place-items-center bg-cream text-gold-soft", className)} role="img" aria-label={alt}>
        <Gem className="size-1/4 max-h-12 max-w-12" strokeWidth={1.2} />
      </div>
    );
  }
  return <Image src={url} alt={alt} className={className} {...props} />;
}
