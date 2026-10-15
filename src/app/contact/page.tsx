import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, sizing or gifting? Reach the Ananta Jewellery team by WhatsApp, phone or email.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const [{ store }, sp] = await Promise.all([getSettings(), searchParams]);
  const order = typeof sp.order === "string" ? sp.order.slice(0, 30) : undefined;
  const address = [store.address, store.city, store.state, store.pincode].filter(Boolean).join(", ");

  const channels = [
    store.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: store.whatsapp, href: whatsappLink(store.whatsapp, `Hi ${store.name}!`), note: "Fastest reply" },
    store.phone && { icon: Phone, label: "Call us", value: store.phone, href: `tel:${store.phone.replace(/\s/g, "")}` },
    store.email && { icon: Mail, label: "Email", value: store.email, href: `mailto:${store.email}` },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string; note?: string }[];

  return (
    <>
      <PageHeader title="We'd love to hear from you" description="Questions about an order, sizing or a gift? Our team is here to help." crumbs={[{ label: "Contact us" }]} />
      <div className="container-x grid gap-10 pb-16 lg:grid-cols-[360px_1fr] lg:gap-16">
        <aside className="space-y-4">
          {channels.map(({ icon: Icon, label, value, href, note }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 rounded-2xl border border-line p-4 transition hover:border-line-strong hover:shadow-soft"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-rose">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-[0.08em] text-muted">
                  {label}
                  {note && <span className="ml-2 normal-case tracking-normal text-success">· {note}</span>}
                </span>
                <span className="block truncate text-[15px] font-medium text-ink">{value}</span>
              </span>
            </a>
          ))}
          <div className="space-y-3 rounded-2xl bg-cream p-5 text-sm text-ink-soft">
            <p className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold" /> Monday to Saturday, 10 am – 7 pm IST
            </p>
            {address && (
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" /> {address}
              </p>
            )}
          </div>
          <p className="text-sm text-muted">
            Looking for an order?{" "}
            <Link href="/track-order" className="font-medium text-rose-dark underline-offset-4 hover:underline">
              Track it here
            </Link>{" "}
            or browse our{" "}
            <Link href="/faq" className="font-medium text-rose-dark underline-offset-4 hover:underline">
              FAQs
            </Link>
            .
          </p>
        </aside>
        <section aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="mb-6 font-display text-3xl text-ink">
            Send us a message
          </h2>
          <ContactForm orderNumber={order} />
        </section>
      </div>
    </>
  );
}
