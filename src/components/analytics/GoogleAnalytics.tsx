"use client";

import Script from "next/script";
import { useConsent } from "@/lib/analytics/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

// Only loads after explicit consent — never fires on first paint, never
// sets a cookie before the visitor has opted in.
export function GoogleAnalytics() {
  const { status } = useConsent();

  if (!GA_ID || status !== "granted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
