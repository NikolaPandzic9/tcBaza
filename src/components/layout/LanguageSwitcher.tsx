"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLanguageVariant, type LanguageVariant } from "@/lib/languageVariant";
import { cn } from "@/lib/cn";

interface LanguageSwitcherProps {
  className?: string;
}

const BS_VARIANTS: LanguageVariant[] = ["bos", "hrv", "srp"];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const t = useTranslations("language");
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { variant, setVariant } = useLanguageVariant();

  const selectBsVariant = (next: LanguageVariant) => {
    setVariant(next);
    if (activeLocale !== "bs") {
      router.replace(pathname, { locale: "bs" });
    }
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={t("label")}
    >
      {BS_VARIANTS.map((bsVariant) => {
        const active = activeLocale === "bs" && variant === bsVariant;
        return (
          <button
            key={bsVariant}
            type="button"
            onClick={() => selectBsVariant(bsVariant)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
              active ? "text-accent-500" : "text-white/60 hover:text-white",
            )}
          >
            {t(bsVariant)}
          </button>
        );
      })}

      <span aria-hidden className="h-3 w-px bg-white/20" />

      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "en" })}
        aria-current={activeLocale === "en" ? "true" : undefined}
        className={cn(
          "px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
          activeLocale === "en" ? "text-accent-500" : "text-white/60 hover:text-white",
        )}
      >
        {t("en")}
      </button>
    </div>
  );
}
