import Link from "next/link";
import { cn, media } from "@/lib/utils";

/** Wordmark, or the uploaded logo when one is set in admin → settings. */
export function Logo({ name, logoUrl, className, light }: { name: string; logoUrl?: string | null; className?: string; light?: boolean }) {
  const src = media(logoUrl);
  const [first, ...rest] = name.split(" ");
  return (
    <Link href="/" className={cn("inline-flex shrink-0 flex-col items-center leading-none", className)} aria-label={`${name} home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded logo of unknown aspect ratio
        <img src={src} alt={name} className="h-9 w-auto sm:h-11" />
      ) : (
        <>
          <span className={cn("text-[24px] font-black tracking-[0.14em] sm:text-[27px]", light ? "text-white" : "text-ink")}>{first.toUpperCase()}</span>
          {rest.length > 0 && (
            <span className={cn("mt-0.5 text-[7.5px] font-bold tracking-[0.5em] sm:text-[8px]", light ? "text-blush" : "text-rose")}>
              {rest.join(" ").toUpperCase()}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
