import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { store, seo } = await getSettings();
  return {
    name: store.name,
    short_name: store.name.split(" ")[0],
    description: seo.defaultDescription,
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New arrivals", url: "/shop?newArrival=1&sort=newest" },
      { name: "Wishlist", url: "/wishlist" },
      { name: "Track order", url: "/track-order" },
    ],
  };
}
