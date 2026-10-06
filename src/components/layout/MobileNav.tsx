"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { isNavLinkActive, NAV_LINKS } from "@/lib/navLinks";
import { cn } from "@/lib/cn";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    // Escape closes; Tab is kept inside the panel so keyboard users can't
    // wander into the page hidden behind the overlay.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label={t("mainNav")}
      className="fixed inset-0 z-50 flex xl:hidden"
    >
      <div aria-hidden className="absolute inset-0 bg-charcoal-950/60" onClick={onClose} />
      <nav
        ref={panelRef}
        aria-label={t("mainNav")}
        className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col gap-1 overflow-y-auto bg-navy-950 px-6 py-6"
      >
        <button
          ref={closeButtonRef}
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

        <BookingContactMenu locale={locale} className="mt-6 w-full" />
      </nav>
    </div>
  );
}
