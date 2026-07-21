"use client";

import { Menu, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/constants";
import { isNavLinkActive, NAV_LINKS } from "@/lib/navLinks";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 shadow-[0_1px_0_0_rgba(255,255,255,0.08)]">
      {/* Utility bar: language only — kept out of the main row so the 8
          nav links have room to breathe. Scrolls with the sticky header
          so switching language stays reachable at any scroll position. */}
      <div className="bg-navy-950 py-1.5">
        <Container className="flex justify-end">
          <LanguageSwitcher />
        </Container>
      </div>

      <div className="bg-navy-700">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <Logo />

          <nav
            aria-label={t("mainNav")}
            className="hidden items-center gap-5 lg:flex"
          >
            {NAV_LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-1 text-sm font-semibold uppercase tracking-wide transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-accent-500 after:transition-all",
                    active
                      ? "text-accent-500 after:w-full"
                      : "text-white/80 after:w-0 hover:text-white hover:after:w-full",
                  )}
                >
                  {t(link.shortMessageKey ?? link.messageKey)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={BUSINESS.phoneHref}
              className="clip-corner hidden items-center gap-2 bg-accent-500 px-4 py-2 font-display text-sm uppercase tracking-wide text-navy-950 transition-colors hover:bg-white sm:flex"
            >
              <Phone className="size-4" aria-hidden />
              {BUSINESS.phone}
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("openMenu")}
              className="p-2 text-white lg:hidden"
            >
              <Menu className="size-6" aria-hidden />
            </button>
          </div>
        </Container>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
