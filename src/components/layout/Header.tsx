"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Heart, Menu, Package, Search, ShoppingCart, User } from "lucide-react";
import { useShell } from "@/components/providers/SettingsProvider";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { MobileMenu } from "./MobileMenu";
import { DeliverPill } from "./DeliverPill";
import { Sheet } from "@/components/ui/sheet";
import { buildNav, buildTopNav, type TopNavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { cartCount, useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/lists";
import { useAuth } from "@/stores/auth";
import { useUi } from "@/stores/ui";

function CountBadge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-2 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-rose px-1 text-[10px] font-bold leading-none text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

function IconLink({ href, label, caption, children, onClick, className }: { href?: string; label: string; caption: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  const cls = cn("flex flex-col items-center gap-0.5 px-1 text-ink transition hover:text-rose [&_svg]:size-[23px]", className);
  const body = (
    <>
      <span className="relative">{children}</span>
      <span className="hidden text-[12px] leading-[22px] tracking-[0.6px] lg:block">{caption}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} aria-label={label} title={label}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label} title={label}>
      {body}
    </button>
  );
}

function TypesPanel({ item, onNavigate }: { item: TopNavItem; onNavigate: () => void }) {
  const types = item.types!;
  const [current, setCurrent] = useState(types[0]?.label);
  const active = types.find((t) => t.label === current) ?? types[0];
  return (
    <div className="grid w-[720px] grid-cols-[220px_1fr]">
      <ul className="border-r border-line py-2">
        {types.map((t) => (
          <li key={t.label}>
            <Link
              href={t.href}
              onMouseEnter={() => setCurrent(t.label)}
              onFocus={() => setCurrent(t.label)}
              onClick={onNavigate}
              className={cn("flex items-center justify-between px-5 py-2.5 text-[15px] transition", t.label === active?.label ? "bg-blush/60 font-bold text-ink" : "text-[#121212bf] hover:text-ink")}
            >
              {t.label} <ChevronRight className="size-4 opacity-60" />
            </Link>
          </li>
        ))}
      </ul>
      {active && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-6">
          {active.columns?.map((col) => (
            <div key={col.title}>
              <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-ink">{col.title}</p>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={onNavigate} className="text-[14px] text-[#121212a6] transition hover:text-rose">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { settings, categories, collections } = useShell();
  const nav = useMemo(() => buildNav(categories, collections), [categories, collections]);
  const topNav = useMemo(() => buildTopNav(categories, collections), [categories, collections]);
  const pathname = usePathname();

  const items = useCart((s) => s.items);
  const wishCount = useWishlist((s) => s.ids.length);
  const customer = useAuth((s) => s.customer);
  const { setCartOpen, menuOpen, setMenuOpen, searchOpen, setSearchOpen } = useUi();

  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setActive(null);
  }

  const hoverOpen = (label: string | null) => {
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => setActive(label), label ? 100 : 150);
  };

  const count = cartCount(items);

  return (
    <header className={cn("sticky top-0 z-40 bg-white transition-shadow", scrolled && "shadow-[0_4px_14px_-8px_rgb(18_18_18/0.25)]")}>
      <div className="container-x flex h-[62px] items-center gap-2 lg:h-[81px] lg:gap-[22px] lg:px-[76px] lg:pt-3">
        <button type="button" onClick={() => setMenuOpen(true)} className="-ml-1 grid size-10 place-items-center text-ink lg:hidden" aria-label="Open menu">
          <Menu className="size-6" />
        </button>

        <Logo name={settings.store.name} logoUrl={settings.store.logoUrl} />

        <DeliverPill className="hidden lg:block" />

        <div className="hidden flex-1 lg:flex">
          <SearchBox />
        </div>

        <nav className="ml-auto flex items-center gap-2.5 sm:gap-4 lg:ml-3 lg:gap-4" aria-label="Account and cart">
          <IconLink href="/track-order" label="Track order" caption="TRACK" className="hidden lg:flex">
            <Package strokeWidth={1.5} />
          </IconLink>
          <IconLink href="/account" label={customer ? `Account — ${customer.name}` : "Sign in"} caption="ACCOUNT" className="hidden sm:flex">
            <User strokeWidth={1.5} />
          </IconLink>
          <IconLink href="/wishlist" label="Wishlist" caption="WISHLIST">
            <Heart strokeWidth={1.5} />
            <CountBadge n={wishCount} />
          </IconLink>
          <IconLink label="Cart" caption="CART" onClick={() => setCartOpen(true)}>
            <ShoppingCart strokeWidth={1.5} />
            <CountBadge n={count} />
          </IconLink>
        </nav>
      </div>

      {/* Mobile search trigger */}
      <div className="container-x pb-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-[42px] w-full items-center justify-between rounded-[4px] border border-[#c9c9c9] px-4 text-[14.5px] text-[#8a8a8a]"
        >
          Search &ldquo;Rings&rdquo;
          <Search className="size-5 text-ink" />
        </button>
      </div>

      {/* Desktop text navigation with dropdowns */}
      <nav className="hidden lg:block" aria-label="Main">
        <ul className="container-x flex flex-wrap items-center lg:px-[76px]">
          {topNav.map((item) => {
            const hasMenu = !!(item.links?.length || item.types?.length);
            const open = active === item.label;
            return (
              <li key={item.label} className="relative" onMouseEnter={() => hoverOpen(hasMenu ? item.label : null)} onMouseLeave={() => hoverOpen(null)}>
                <Link
                  href={item.href}
                  onClick={() => setActive(null)}
                  onFocus={() => setActive(hasMenu ? item.label : null)}
                  aria-expanded={hasMenu ? open : undefined}
                  className={cn(
                    "flex items-center gap-1 px-5 py-2 text-[16px] leading-[28.8px] tracking-[0.6px] transition-colors",
                    open ? "text-ink underline underline-offset-[6px]" : "text-[#121212bf] hover:text-ink",
                  )}
                >
                  {item.label}
                  {hasMenu && <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />}
                </Link>
                {open && hasMenu && (
                  <div
                    className={cn(
                      "absolute top-full z-50 animate-fade-in rounded-b-[8px] border border-line bg-white shadow-lift",
                      item.types ? "left-0" : "left-1/2 -translate-x-1/2",
                    )}
                    onKeyDown={(e) => e.key === "Escape" && setActive(null)}
                  >
                    {item.types ? (
                      <TypesPanel item={item} onNavigate={() => setActive(null)} />
                    ) : (
                      <ul className="min-w-[220px] py-2">
                        {item.links!.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} onClick={() => setActive(null)} className="block whitespace-nowrap px-5 py-2 text-[14.5px] text-[#121212bf] transition hover:bg-blush/50 hover:text-ink">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileMenu nav={nav} open={menuOpen} onOpenChange={setMenuOpen} />

      <Sheet open={searchOpen} onOpenChange={setSearchOpen} side="bottom" title="Search" className="h-[88dvh]">
        <SearchBox variant="panel" autoFocus onNavigate={() => setSearchOpen(false)} />
      </Sheet>
    </header>
  );
}
