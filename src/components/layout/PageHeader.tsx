import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[12.5px] text-muted", className)}>
      <JsonLd data={ld} />
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-line-strong" />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink-soft" aria-current={i === all.length - 1 ? "page" : undefined}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Listing / content page title block, optionally over a banner image. */
export function PageHeader({
  title,
  description,
  crumbs,
  eyebrow,
  banner,
}: {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  eyebrow?: string;
  banner?: string | null;
}) {
  if (banner) {
    return (
      <div className="container-x pt-3">
        <Breadcrumbs items={crumbs} className="mb-3" />
        <div className="relative overflow-hidden rounded-[12px] bg-cream">
          <div className="relative h-40 sm:h-56 lg:h-64">
            <Img src={banner} alt="" fill preload sizes="100vw" className="object-cover object-[75%_center]" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-transparent" />
            <div className="relative flex h-full max-w-xl flex-col justify-center px-5 sm:px-10">
              {eyebrow && <p className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-rose">{eyebrow}</p>}
              <h1 className="text-[28px] font-black leading-tight text-rose-dark sm:text-[42px]">{title}</h1>
              {description && <p className="mt-2 line-clamp-2 text-[13px] text-[#121212bf] sm:text-[15px]">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container-x pt-3">
      <Breadcrumbs items={crumbs} />
      <div className="py-5 text-center sm:py-7">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-[26px] font-normal text-ink sm:text-[30px]">{title}</h1>
        {description && <p className="mx-auto mt-2 max-w-2xl text-[15px] text-[#121212bf]">{description}</p>}
      </div>
    </div>
  );
}
