import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { StoreLine } from "@/components/home/StoreLine";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickView } from "@/components/product/QuickView";
import { CompareTray } from "@/components/lists/CompareTray";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSettings } from "@/lib/settings";
import { getJsonSafe } from "@/lib/server-api";
import { SITE_URL } from "@/lib/config";
import { media } from "@/lib/utils";
import type { Category, Collection } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { store, seo } = await getSettings();
  const og = media(seo.ogImage);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.defaultTitle, template: `%s | ${store.name}` },
    description: seo.defaultDescription,
    applicationName: store.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: store.name,
      locale: "en_IN",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: "summary_large_image", title: seo.defaultTitle, description: seo.defaultDescription },
    icons: store.faviconUrl ? { icon: media(store.faviconUrl)! } : undefined,
    appleWebApp: { capable: true, title: store.name, statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories, collections] = await Promise.all([
    getSettings(),
    getJsonSafe<Category[]>("/catalog/categories", [], { revalidate: 300, tags: ["categories"] }),
    getJsonSafe<Collection[]>("/catalog/collections", [], { revalidate: 300, tags: ["collections"] }),
  ]);
  const { store } = settings;

  const organization = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: store.name,
    url: SITE_URL,
    logo: media(store.logoUrl) ?? `${SITE_URL}/icon/512`,
    email: store.email,
    telephone: store.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressRegion: store.state,
      postalCode: store.pincode,
      addressCountry: "IN",
    },
    sameAs: Object.values(store.social ?? {}).filter(Boolean),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: store.name,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <JsonLd data={[organization, website]} />
        <SettingsProvider value={{ settings, categories, collections }}>
          <Providers>
            {store.announcement && <AnnouncementBar text={store.announcement} />}
            <Header />
            <Suspense fallback={null}>
              <StoreLine />
            </Suspense>
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer settings={settings} categories={categories} collections={collections} />
            <CartDrawer />
            <QuickView />
            <CompareTray />
            <WhatsAppButton number={store.whatsapp} storeName={store.name} />
          </Providers>
        </SettingsProvider>
      </body>
    </html>
  );
}
