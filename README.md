# Ananta Jewellery — Storefront

Customer-facing store for Ananta Jewellery: browse, search, wishlist, compare, bag, checkout (Razorpay, UPI, COD), order tracking and the customer account.
Built with Next.js 16 (App Router, React Compiler), React 19, Tailwind CSS 4, TanStack Query 5, Zustand and Zod.

## Running locally

The API (`../ananta-jewellery-Backend`) must be running first, on port 4000 by default.

```bash
cp .env.example .env     # point NEXT_PUBLIC_API_URL at the API
npm install
npm run dev              # http://localhost:3005
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on `PORT` (3005) |
| `npm run build` / `npm start` | Production build and server. The API must be reachable at build time, because the home page, policies and sitemap are prerendered |
| `npm run typecheck` | `tsc --noEmit` (run `npx next typegen` first after adding routes) |
| `npm run lint` | ESLint (Next + React Compiler rules) |

### Environment

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for dev/start (default 3005) |
| `NEXT_PUBLIC_API_URL` | API origin; `/api/v1` is appended automatically. Its `/uploads/**` path is allowed for `next/image` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the store, used for canonical links, the sitemap, Open Graph and JSON-LD |
| `NEXT_PUBLIC_MEDIA_HOST` | Optional HTTPS host for product images on S3 or a CDN |
| `IMAGES_ALLOW_LOCAL_IP` | `1` in development only, so `next/image` can fetch from an API on localhost. Never set it in production |

### Test sign-ins

The seeded customer is `priya@example.com` / `Customer@123`. Shoppers can sign in with either their email or their mobile number.
When the API has no Razorpay keys, checkout opens a mock payment sheet instead of Razorpay, so you can test the full online-payment flow locally.

## Pages

| Area | Routes |
| --- | --- |
| Shop | `/` home, `/shop`, `/category/[slug]`, `/collections`, `/collections/[slug]`, `/gifting`, `/search`, `/products/[slug]` |
| Lists | `/wishlist`, `/compare` (up to four pieces), plus the bag drawer and `/cart` |
| Checkout | `/checkout` (guest or signed in, coupons, Ananta points, gift note), `/checkout/success` |
| Account | `/account` overview, orders (cancel, return within 30 days, invoice, pay now), addresses, Ananta points ledger, profile and password |
| Auth | `/login`, `/register`, `/forgot-password`, `/account/reset-password` |
| Help | `/track-order`, `/faq`, `/contact`, `/policies/{shipping,returns,privacy,terms}`, `/about` |
| Content | `/blog` (journal and lookbook), `/blog/[slug]` |
| Special files | `sitemap.xml`, `robots.txt`, `manifest.webmanifest`, generated icons and Open Graph image, `/sw.js` with an offline page |

## How it fits together

- **Data:** server components read through `src/lib/server-api.ts` (`getJson`, `getJsonOrNull`, `getJsonSafe`), cached with `revalidate`. Client components call `api()` from `src/lib/api.ts` through TanStack Query.
- **Auth:** the access token stays in memory only; the refresh token is an httpOnly cookie set by the API. `aj-session` in localStorage is just a hint, so guests don't attempt a refresh on every visit. Account pages sit under `src/app/account/(member)` and are guarded by `AccountShell`.
- **Client state:** Zustand stores in `src/stores` hold the bag, wishlist, compare list and recently viewed items. They persist with `skipHydration` and are hydrated in `StoreBootstrap`; use `useWishlistHydrated()` and the other hydration hooks before reading them, to avoid hydration mismatches. The bag stores only variant ids and quantities, and prices always come from the API quote.
- **Payments:** `PaymentProvider` loads Razorpay Checkout on demand and verifies payments through the API. The same flow powers "Pay now" on unpaid orders.
- **SEO:** each page exports metadata; products, breadcrumbs, FAQs, blog posts and the organisation emit JSON-LD (`src/components/seo`). Private pages are `noindex` and disallowed in `robots.ts`.
- **Rich text:** product descriptions and blog posts come from the admin as HTML that the API sanitises on save. `resolveHtmlMedia()` rewrites `/uploads/` image paths to the API origin.
- **Copy:** policy and FAQ text lives in `src/content` and reads contact details, shipping thresholds and the return window from the public store settings.

## Project layout

```
src/
  app/          routes (App Router), metadata files, error and loading boundaries
  components/   UI by feature: layout, home, listing, product, cart, checkout, account, orders, lists, blog, forms, seo, ui
  content/      policy and FAQ copy
  hooks/        bag, quote, shop and clock hooks
  lib/          API clients, config, types, formatting, order helpers
  stores/       Zustand stores (auth, cart, lists, ui)
public/         service worker, offline page, static assets
```
