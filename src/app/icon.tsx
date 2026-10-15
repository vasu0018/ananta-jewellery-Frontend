import { ImageResponse } from "next/og";
import { Monogram } from "@/lib/brand-image";

/** Favicon plus the 192/512 PNGs referenced by the web app manifest (served at /icon/<id>). */
export function generateImageMetadata() {
  return [32, 192, 512].map((n) => ({ id: String(n), size: { width: n, height: n }, contentType: "image/png" }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const size = Number(await id);
  return new ImageResponse(<Monogram size={size} rounded={size <= 32} />, { width: size, height: size });
}
