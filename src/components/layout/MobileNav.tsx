"use client";

import { Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/constants";
import { isNavLinkActive, NAV_LINKS } from "@/lib/navLinks";
import { cn } from "@/lib/cn";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex xl:hidden">
      <div className="absolute inset-0 bg-charcoal-950/60" onClick={onClose} />
      <nav
        aria-label={t("mainNav")}
        className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col gap-1 bg-navy-950 px-6 py-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("closeMenu")}
          className="ml-auto p-2 text-white/70 hover:text-white"
        >
          <X className="size-6" aria-hidden />
        </button>

        {NAV_LINKS.map((link) => {
          const active = isNavLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b border-white/10 py-4 font-display text-lg uppercase tracking-wide transition-colors",
                active ? "text-accent-500" : "text-white hover:text-accent-500",
              )}
            >
              {t(link.messageKey)}
            </Link>
          );
        })}

        <a
          href={BUSINESS.phoneHref}
          className="mt-6 flex items-center justify-center gap-2 bg-accent-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-navy-950 clip-corner"
        >
          <Phone className="size-4" aria-hidden />
          {BUSINESS.phone}
        </a>
      </nav>
    </div>
  );
}
