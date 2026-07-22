import { Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BUSINESS } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/navLinks";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations();
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy-950 text-white/70">
      <VertebraeDivider className="h-3 w-full text-navy-500/40" />

      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="white" />
          <p className="mt-4 font-display text-sm uppercase tracking-wide text-accent-500">
            {t("footer.tagline")}
          </p>
          <a
            href={BUSINESS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white"
          >
            <InstagramIcon className="size-4" aria-hidden />
            {BUSINESS.instagramHandle}
          </a>
        </div>

        <div>
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-white/60">
            {t("footer.navTitle")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {tNav(link.messageKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-white/60">
            {t("footer.legalTitle")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/politika-privatnosti" className="hover:text-white">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/uslovi-koristenja" className="hover:text-white">
                {t("footer.terms")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-white/60">
            {t("footer.addressLabel")}
          </h2>
          <p className="mt-4 flex gap-2">
            <MapPin className="size-4 shrink-0 translate-y-0.5" aria-hidden />
            <span>
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.city}, {BUSINESS.address.country}
            </span>
          </p>
          <a
            href={BUSINESS.phoneHref}
            className="mt-3 flex items-center gap-2 hover:text-white"
          >
            <Phone className="size-4" aria-hidden />
            {BUSINESS.phone}
          </a>
          <p className="mt-3 flex items-center gap-2">
            <Clock className="size-4 shrink-0" aria-hidden />
            {BUSINESS.hours.opens}–{BUSINESS.hours.closes} ({t("footer.hoursEveryDay")})
          </p>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {BUSINESS.name}. {t("footer.rights")}
          </p>
          <p>{BUSINESS.legalSlogan}</p>
        </Container>
      </div>
    </footer>
  );
}
