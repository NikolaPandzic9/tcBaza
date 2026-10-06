"use client";

import { MapPin, Phone } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { getWhatsAppUrl } from "@/lib/siteInfo";
import { useSiteInfo } from "@/components/site/SiteInfoProvider";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

// Fills the gap left when the header's booking CTA hides below `sm` —
// most visitors are on phones, so the three actions that actually lead to
// a booking (call, WhatsApp, directions) stay one tap away at all times.
export function StickyCallCta() {
  const t = useTranslations("cta");
  const locale = useLocale() as Locale;
  const info = useSiteInfo();

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2 font-display text-[0.7rem] uppercase tracking-wide transition-colors active:bg-white/10";

  return (
    <nav
      aria-label={locale === "bs" ? "Brzi kontakt" : "Quick contact"}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-navy-900 bg-navy-950 pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <a href={info.phoneHref} className={`${itemClass} text-accent-500`}>
        <Phone className="size-5" aria-hidden />
        {t("call")}
      </a>
      <a
        href={getWhatsAppUrl(info, locale)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${itemClass} border-x border-white/10 text-white`}
      >
        <WhatsAppIcon className="size-5 text-[#25D366]" aria-hidden />
        WhatsApp
      </a>
      <a
        href={info.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${itemClass} text-white`}
      >
        <MapPin className="size-5" aria-hidden />
        {locale === "bs" ? "Lokacija" : "Directions"}
      </a>
    </nav>
  );
}
