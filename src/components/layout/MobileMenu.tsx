"use client";

import Link from "next/link";
import { Accordion as Primitive } from "radix-ui";
import { ChevronDown, Heart, LogIn, Package, Phone, User } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useAuth } from "@/stores/auth";
import type { NavItem } from "@/lib/nav";

/** Slide-in navigation for small screens: categories expand into their menu columns. */
export function MobileMenu({ nav, open, onOpenChange }: { nav: NavItem[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const settings = useSettings();
  const customer = useAuth((s) => s.customer);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} side="left" title="Menu" bodyClassName="px-0 pb-0">
      <div className="flex h-full flex-col">
        <Link
          href="/account"
          onClick={close}
          className="mx-5 mb-3 flex items-center gap-3 rounded-2xl bg-blush px-4 py-3.5"
        >
          <span className="grid size-10 place-items-center rounded-full bg-white text-rose">
            {customer ? <User className="size-5" /> : <LogIn className="size-5" />}
          </span>
          <span>
            <span className="block text-sm font-medium text-ink">{customer ? `Hi, ${customer.name.split(" ")[0]}` : "Sign in / Register"}</span>
            <span className="block text-xs text-muted">{customer ? "Orders, wishlist & rewards" : "Track orders, save favourites"}</span>
          </span>
        </Link>

        <Primitive.Root type="single" collapsible className="flex-1 overflow-y-auto px-5">
          {nav.map((item) =>
            item.columns?.length ? (
              <Primitive.Item key={item.label} value={item.label} className="border-b border-line">
                <Primitive.Header>
                  <Primitive.Trigger className="group -mx-2 flex w-[calc(100%+16px)] items-center justify-between rounded-[8px] px-2 py-3.5 text-left text-[15px] font-medium text-ink transition-colors hover:bg-[#ffe8ee]">
                    <span className={item.highlight ? "text-rose-dark" : undefined}>{item.label}</span>
                    <ChevronDown className="size-4 text-muted transition-transform group-data-[state=open]:rotate-180" />
                  </Primitive.Trigger>
                </Primitive.Header>
                <Primitive.Content className="pb-4">
                  <Link href={item.href} onClick={close} className="mb-3 inline-block text-sm font-medium text-rose-dark">
                    Shop all {item.label} →
                  </Link>
                  <div className="space-y-4">
                    {item.columns.map((col) => (
                      <div key={col.title}>
                        <p className="eyebrow mb-2">{col.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {col.links.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              onClick={close}
                              className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:border-ink hover:bg-[#ffe8ee] hover:text-ink"
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Primitive.Content>
              </Primitive.Item>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className={`-mx-2 block rounded-[8px] border-b border-line px-2 py-3.5 text-[15px] font-medium transition-colors hover:bg-[#ffe8ee] ${item.highlight ? "text-rose-dark" : "text-ink"}`}
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="space-y-1 py-4 text-sm text-ink-soft">
            <Link href="/wishlist" onClick={close} className="-mx-2 flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#ffe8ee]">
              <Heart className="size-4" /> Wishlist
            </Link>
            <Link href="/track-order" onClick={close} className="-mx-2 flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#ffe8ee]">
              <Package className="size-4" /> Track order
            </Link>
            <Link href="/blog" onClick={close} className="-mx-2 flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#ffe8ee]">
              <span className="size-4 text-center font-display">✦</span> Journal
            </Link>
            <a href={`tel:${settings.store.phone.replace(/\s/g, "")}`} className="-mx-2 flex items-center gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#ffe8ee]">
              <Phone className="size-4" /> {settings.store.phone}
            </a>
          </div>
        </Primitive.Root>
      </div>
    </Sheet>
  );
}
