"use client";

import Script from "next/script";
import { useConsent } from "@/lib/analytics/consent";

const PIXEL_ENABLED = process.env.NEXT_PUBLIC_META_PIXEL_ENABLED === "true";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Wired but off by default (NEXT_PUBLIC_META_PIXEL_ENABLED) — flip the
// env var when marketing actually starts. Still gated on consent even
// then, same as GoogleAnalytics.
export function MetaPixel() {
  const { status } = useConsent();

  if (!PIXEL_ENABLED || !PIXEL_ID || status !== "granted") return null;

  return (
    <Script id="meta-pixel-init" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
