import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Origin-allowlisted rather than nonce-based: threading a per-request
// nonce through next-intl's middleware into Server Components requires
// forking its request-header handling, which is riskier than it's worth
// for this site's threat model. See HANDOVER.md for the nonce upgrade path.
const CSP = [
  "default-src 'self'",
  // React uses eval() for dev-only debugging; production never does.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://www.google-analytics.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com",
  "frame-src https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smallest), WebP fallback — next/image negotiates per browser.
    formats: ["image/avif", "image/webp"],
    // ERP uploads (Vercel Blob public store).
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // ERP media uploads arrive through a Server Action. Images are
      // resized in the browser first; Vercel caps bodies at ~4.5 MB anyway.
      bodySizeLimit: "4.5mb",
    },
  },
  // The ERP runs on its own subdomain; in development that's erp.localhost.
  allowedDevOrigins: ["erp.localhost"],
  // The former martial-arts program page was replaced by Sportski pasoš —
  // 301s keep any existing links and search rankings pointing somewhere real.
  async redirects() {
    return [
      { source: "/usluge/kik-boks", destination: "/usluge/sportski-pasos", statusCode: 301 },
      { source: "/bs/usluge/kik-boks", destination: "/usluge/sportski-pasos", statusCode: 301 },
      {
        source: "/en/services/kickboxing",
        destination: "/en/services/sports-passport",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // ERP pages carry personal data: never cache them anywhere and keep
        // them out of search engines.
        source: "/(.*)",
        has: [{ type: "host", value: "erp\\..*" }],
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
