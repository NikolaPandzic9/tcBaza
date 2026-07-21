"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/constants";

// Fills the gap left when the header's phone CTA hides below `sm` — the
// spec requires the phone number clickable and visible on mobile at all
// times, without duplicating the header CTA on larger screens.
export function StickyCallCta() {
  const t = useTranslations("cta");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-900 bg-navy-950 pb-[env(safe-area-inset-bottom)] sm:hidden">
      <a
        href={BUSINESS.phoneHref}
        className="flex items-center justify-center gap-2 py-3 font-display text-sm uppercase tracking-wide text-accent-500"
      >
        <Phone className="size-4" aria-hidden />
        {t("call")} — {BUSINESS.phone}
      </a>
    </div>
  );
}
