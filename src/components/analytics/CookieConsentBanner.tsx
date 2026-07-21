"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConsent } from "@/lib/analytics/consent";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { cn } from "@/lib/cn";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

// Only shown when NEXT_PUBLIC_GA4_ID is configured — no analytics wired
// up means nothing to ask consent for.
export function CookieConsentBanner() {
  const t = useTranslations("consent");
  const { status, grant, deny } = useConsent();

  if (!GA_ID || status !== "unknown") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy-900 bg-navy-950 px-6 py-4 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-white/80 sm:text-sm">
          {t("text")}{" "}
          <Link href="/politika-privatnosti" className="underline hover:text-accent-500">
            {t("link")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={deny}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:text-white"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={grant}
            className={cn(
              buttonBaseClasses,
              buttonVariantClasses.secondary,
              "px-4 py-2 text-xs",
            )}
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
