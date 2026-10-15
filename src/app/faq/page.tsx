import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqGroups } from "@/content/faq";
import { getSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers about orders, payments, shipping, returns, jewellery care and Ananta points.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const settings = await getSettings();
  const groups = faqGroups(settings);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <PageHeader title="Frequently asked questions" description="Everything you need to know about shopping with us." crumbs={[{ label: "FAQs" }]} />
      <div className="container-x mx-auto max-w-3xl pb-16">
        <nav aria-label="FAQ topics" className="mb-10 flex flex-wrap justify-center gap-2">
          {groups.map((g) => (
            <a key={g.title} href={`#${slugify(g.title)}`} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition hover:border-ink hover:text-ink">
              {g.title}
            </a>
          ))}
        </nav>
        <div className="space-y-12">
          {groups.map((g) => (
            <section key={g.title} id={slugify(g.title)} className="scroll-mt-32">
              <h2 className="mb-3 font-display text-2xl text-ink sm:text-3xl">{g.title}</h2>
              <Accordion items={g.items.map((i, idx) => ({ id: `${slugify(g.title)}-${idx}`, title: i.q, content: <p>{i.a}</p> }))} />
            </section>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-cream p-8 text-center">
          <MessageCircle className="size-8 text-rose" />
          <p className="font-display text-2xl text-ink">Still have a question?</p>
          <p className="text-sm text-muted">Our team replies within 24 hours, Monday to Saturday.</p>
          <Button asChild>
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
