"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const STORES = [
  { id: "silver", label: "Silver Jewellery", href: "/" },
  { id: "gold", label: "Gold Jewellery", href: "/gold" },
  { id: "demifine", label: "Demifine Jewellery", href: "/demifine" },
] as const;

const ACTIVE: Record<(typeof STORES)[number]["id"], string> = {
  silver: "bg-maroon-grad text-white",
  gold: "bg-[#1f6a45] text-white",
  demifine: "bg-[#243f8f] text-white",
};

/** GIVA-style store switcher. Highlights the store the shopper is actually in. */
export function StoreLine() {
  const pathname = usePathname();
  const params = useSearchParams();
  const show = pathname === "/" || pathname === "/gold" || pathname === "/demifine" || pathname === "/shop";
  if (!show) return null;

  const current =
    pathname === "/gold" ? "gold" : pathname === "/demifine" ? "demifine" : pathname === "/shop" ? params.get("store") : "silver";

  return (
    <div className="container-x flex justify-center pb-3 pt-3">
      <div className="w-full max-w-[760px] rounded-[24px] bg-[linear-gradient(90deg,#e1bf7c_0%,#dbd295_52.4%,#b57e10_100%)] p-px">
        <div className="grid grid-cols-3 rounded-[24px] bg-white">
          {STORES.map((s) => {
            const on = current === s.id;
            return (
              <Link
                key={s.id}
                href={s.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex h-[36px] items-center justify-center whitespace-nowrap rounded-[24px] px-1 text-[11px] transition sm:h-[40px] sm:text-[15px] sm:tracking-[0.4px]",
                  on ? ACTIVE[s.id] : "text-[#25282b] hover:text-rose-dark",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
