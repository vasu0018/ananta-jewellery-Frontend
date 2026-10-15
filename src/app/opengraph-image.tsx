import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-image";
import { getSettings } from "@/lib/settings";

export const alt = "Ananta Jewellery — certified silver & lab-grown diamond jewellery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social card for pages that don't set their own image. */
export default async function OpengraphImage() {
  const { store } = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${BRAND.blush} 0%, ${BRAND.cream} 50%, #efe2cb 100%)`,
          color: BRAND.ink,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: BRAND.gold, textTransform: "uppercase" }}>Fine jewellery · Designed in India</div>
        <div style={{ display: "flex", fontSize: 120, letterSpacing: 18, marginTop: 24 }}>{store.name.split(" ")[0].toUpperCase()}</div>
        <div style={{ display: "flex", width: 120, height: 2, background: BRAND.gold, marginTop: 20 }} />
        <div style={{ display: "flex", fontSize: 34, marginTop: 28, color: "#3d3633" }}>{store.tagline}</div>
        <div style={{ display: "flex", fontSize: 24, marginTop: 40, color: BRAND.rose }}>Free shipping · 30-day returns · Lifetime plating</div>
      </div>
    ),
    size,
  );
}
