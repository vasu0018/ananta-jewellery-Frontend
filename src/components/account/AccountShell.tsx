"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/misc";
import { logout } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useAuth } from "@/stores/auth";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/loyalty", label: "Ananta points", icon: Sparkles },
  { href: "/account/profile", label: "Profile & security", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  return href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Signed-in area chrome. Guests are sent to the login page and brought back afterwards. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const status = useAuth((s) => s.status);
  const customer = useAuth((s) => s.customer);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (status === "guest" && !leaving) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, leaving, pathname, router]);

  const signOut = async () => {
    setLeaving(true);
    await logout(queryClient);
    toast.success("You've been signed out");
    router.replace("/");
  };

  if (status !== "authenticated" || !customer) {
    return (
      <div className="container-x py-10" aria-busy>
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <Skeleton className="hidden h-72 lg:block" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <p className="eyebrow mb-1.5">My account</p>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">Hello, {customer.name.split(" ")[0]}</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <nav aria-label="Account" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="shrink-0">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition lg:rounded-xl lg:border-0 lg:py-2.5",
                      active ? "border-ink bg-ink text-white lg:bg-blush lg:text-ink" : "border-line text-ink-soft hover:bg-cream hover:text-ink",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "lg:text-rose" : "text-muted")} />
                    {label}
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0 lg:mt-3 lg:border-t lg:border-line lg:pt-3">
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={leaving}
                className="flex w-full items-center gap-3 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition hover:bg-cream hover:text-ink disabled:opacity-60 lg:rounded-xl lg:border-0 lg:py-2.5"
              >
                <LogOut className="size-4 text-muted" />
                Sign out
              </button>
            </li>
          </ul>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Section heading used at the top of each account page. */
export function AccountHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl text-ink sm:text-[28px]">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
