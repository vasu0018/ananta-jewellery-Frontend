import type { NextConfig } from "next";

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Allow opening the store via LAN IP in `next dev` (other PCs / phone)
  allowedDevOrigins: ["*.local", "127.0.0.1"],
  images: {
    // Product photos are uploaded to the API (or its S3/CDN origin when configured).
    remotePatterns: [
      { protocol: apiOrigin.protocol.replace(":", "") as "http" | "https", hostname: apiOrigin.hostname, port: apiOrigin.port, pathname: "/uploads/**" },
      ...(process.env.NEXT_PUBLIC_MEDIA_HOST ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_MEDIA_HOST }] : []),
    ],
    // The API runs on localhost in development; never enable this for a public deployment (SSRF risk).
    dangerouslyAllowLocalIP: process.env.IMAGES_ALLOW_LOCAL_IP === "1",
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")" },
        ],
      },
    ];
  },
};

export default nextConfig;
