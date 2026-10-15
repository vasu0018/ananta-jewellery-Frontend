import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPolicy, POLICIES } from "@/content/policies";
import { formatDate } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const policy = getPolicy((await params).slug);
  if (!policy) return {};
  return { title: policy.title, description: policy.summary, alternates: { canonical: `/policies/${policy.slug}` } };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();
  const settings = await getSettings();
  const sections = policy.sections(settings);

  return (
    <>
      <PageHeader title={policy.title} description={policy.summary} crumbs={[{ label: "Policies" }, { label: policy.title }]} />
      <div className="container-x grid gap-10 pb-16 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {POLICIES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/policies/${p.slug}`}
                  aria-current={p.slug === policy.slug ? "page" : undefined}
                  className={cn(
                    "block rounded-full border px-4 py-1.5 text-sm transition lg:rounded-xl lg:border-0 lg:py-2",
                    p.slug === policy.slug ? "border-ink bg-ink text-white lg:bg-blush lg:text-ink" : "border-line text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faq" className="block rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition hover:bg-cream hover:text-ink lg:rounded-xl lg:border-0 lg:py-2">
                FAQs
              </Link>
            </li>
          </ul>
        </nav>

        <article className="prose-ananta max-w-3xl">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="!mt-10 text-sm text-muted">Last updated {formatDate(policy.updated)}</p>
        </article>
      </div>
    </>
  );
}
