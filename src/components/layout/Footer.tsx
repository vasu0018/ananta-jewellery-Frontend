import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";
import type { Category, Collection, PublicSettings } from "@/lib/types";

function SocialIcon({ name }: { name: string }) {
  // Simple monochrome glyphs; lucide dropped brand icons.
  const paths: Record<string, string> = {
    instagram:
      "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.2c-.1-1.5-.4-2.8-1.5-3.8-1-1-2.4-1.4-3.8-1.5C14.2 2.8 9.8 2.8 8.3 2.9c-1.5.1-2.8.4-3.8 1.5-1.1 1-1.4 2.3-1.5 3.8-.1 1.5-.1 6 0 7.5.1 1.5.4 2.8 1.5 3.8 1.1 1 2.3 1.4 3.8 1.5 1.5.1 6 .1 7.5 0 1.5-.1 2.8-.4 3.8-1.5 1-1 1.4-2.3 1.5-3.8.1-1.5.1-6 0-7.5Zm-2 9.1a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3a3 3 0 0 1 1.7-1.7c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.3s.1 4.1-.4 5.3Z",
    facebook: "M14 13.5h2.5l1-4H14v-2c0-1 0-2 2-2h1.5V2.1c-.3 0-1.6-.1-2.9-.1-2.7 0-4.6 1.7-4.6 4.7v2.8H7v4h3V22h4v-8.5Z",
    youtube:
      "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z",
    pinterest:
      "M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3l.1.4-.3 1.1c0 .2-.2.3-.4.2-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1 0 12 2Z",
  };
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="currentColor" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}

function Column({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-[20px] font-bold text-ink sm:text-[22px]">{title}</p>
      <ul className="space-y-2.5 text-[15px] text-[#121212bf]">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="transition hover:text-ink hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SearchRow({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  if (!links.length) return null;
  return (
    <p className="text-[13.5px] leading-7 text-[#121212a6]">
      <span className="font-bold text-ink">{title}: </span>
      {links.map((l, i) => (
        <span key={l.href}>
          <Link href={l.href} className="hover:text-ink hover:underline">
            {l.label}
          </Link>
          {i < links.length - 1 && (
            <>
              <span className="pl-1.5 pr-1 text-line-strong">|</span>{" "}
            </>
          )}
        </span>
      ))}
    </p>
  );
}

export function Footer({ settings, categories, collections }: { settings: PublicSettings; categories: Category[]; collections: Collection[] }) {
  const { store } = settings;
  const socials = Object.entries(store.social ?? {}).filter(([, url]) => !!url);
  const year = new Date().getFullYear();
  const typeLinks = categories.flatMap((c) => [{ label: c.name, href: `/category/${c.slug}` }, ...(c.children ?? []).map((s) => ({ label: s.name, href: `/category/${s.slug}` }))]);
  const col = (t: Collection["type"]) => collections.filter((c) => c.type === t).map((c) => ({ label: c.name, href: `/collections/${c.slug}` }));

  return (
    <footer className="mt-12 bg-[#f0f0f0] text-ink">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1.4fr]">
        <Column
          title="Quick links"
          links={[
            ["Customer Reviews", "/shop?sort=rating"],
            ["Our Blogs", "/blog"],
            ["Track Your Order", "/track-order"],
            ["Collections", "/collections"],
            ["Gift Store", "/gifting"],
            ["Our Story", "/about"],
          ]}
        />
        <Column
          title="Info"
          links={[
            ["Shipping & Returns", "/policies/shipping"],
            ["Returns & Exchanges", "/policies/returns"],
            ["Privacy Policy", "/policies/privacy"],
            ["Terms of Service", "/policies/terms"],
            ["FAQs & Support", "/faq"],
            ["My Account", "/account"],
          ]}
        />
        <div>
          <p className="mb-4 text-[20px] font-bold sm:text-[22px]">Contact us</p>
          <div className="space-y-2.5 text-[15px] text-[#121212bf]">
            <p className="font-bold text-ink">{store.name}</p>
            {store.city && <p>{[store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ")}</p>}
            <p>
              Contact:{" "}
              <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="hover:text-ink hover:underline">
                {store.phone}
              </a>
            </p>
            <p>
              Email:{" "}
              <a href={`mailto:${store.email}`} className="break-all hover:text-ink hover:underline">
                {store.email}
              </a>
            </p>
            {store.whatsapp && (
              <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-rose hover:underline">
                Chat with us on WhatsApp
              </a>
            )}
            <p className="text-[13.5px]">Mon – Sat, 10am – 7pm IST</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[20px] font-bold sm:text-[22px]">Subscribe to our newsletter</p>
          <p className="mb-4 text-[14px] text-[#121212bf]">Early access to new launches and members-only offers.</p>
          <NewsletterForm tone="light" />
          {socials.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              {socials.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full bg-white text-ink transition hover:text-rose"
                  aria-label={name}
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          )}
          <p className="mb-2 mt-6 text-[14px] font-bold">Payment methods</p>
          <div className="flex flex-wrap items-center gap-2">
            {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "COD"].map((m) => (
              <span key={m} className="rounded-[4px] border border-[#d6d6d6] bg-white px-2 py-1 text-[11px] font-bold text-ink-soft">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#dedede]">
        <div className="container-x space-y-1 py-6">
          <p className="mb-2 text-[18px] font-bold">Popular Searches</p>
          <SearchRow title="Jewellery" links={typeLinks} />
          <SearchRow title="Shop by Colour" links={col("COLOUR")} />
          <SearchRow title="Occasions" links={col("OCCASION")} />
          <SearchRow title="Gifts" links={[...col("BOND"), ...col("GIFTING")]} />
          <SearchRow title="Collections" links={[...col("CURATED"), ...col("CELEBRITY")]} />
        </div>
      </div>

      <div className="border-t border-[#dedede]">
        <p className="container-x py-4 text-center text-[13px] text-[#121212a6]">
          © {year}, {store.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
