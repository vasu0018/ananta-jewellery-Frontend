import type { PublicSettings } from "./types";
import { getJsonSafe } from "./server-api";

/** Used when the API is unreachable so the shell still renders. */
export const DEFAULT_SETTINGS: PublicSettings = {
  store: {
    name: "Ananta Jewellery",
    tagline: "Fine silver & lab-grown diamond jewellery",
    logoUrl: null,
    faviconUrl: null,
    email: "care@anantajewellery.in",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    address: "",
    city: "Surat",
    state: "Gujarat",
    pincode: "",
    country: "India",
    social: {},
    announcement: "Free shipping on orders above ₹999 · Lifetime plating service",
  },
  seo: {
    defaultTitle: "Ananta Jewellery — Silver & Lab-Grown Diamond Jewellery",
    defaultDescription: "Shop certified 925 silver, gold-plated and lab-grown diamond jewellery. Free shipping, easy 30-day returns & COD available.",
    ogImage: null,
  },
  checkout: { freeShippingAbove: 999, codEnabled: true, codFee: 0, giftWrapFee: 0, guestCheckout: true },
  loyalty: { enabled: false, pointValue: 1, earnPer100: 0, signupBonus: 0 },
  payments: { razorpayEnabled: true, razorpayKeyId: null, mock: true, methods: {} },
};

/** Store settings for Server Components (memoized per render, cached for 5 minutes). */
export function getSettings() {
  return getJsonSafe<PublicSettings>("/settings/public", DEFAULT_SETTINGS, { revalidate: 300, tags: ["settings"] });
}
