import { Clock, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Pathnames } from "@/i18n/routing";
import { BUSINESS } from "@/lib/constants";
import type { SiteInfo } from "@/lib/siteInfo";
import type { NavMessageKey } from "@/lib/navLinks";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { Logo } from "./Logo";

// A short, curated set — not the full header nav. The footer's job is a
// quick way back to the pages people actually look for from here.
const FOOTER_LINKS: { href: Pathnames; messageKey: NavMessageKey }[] = [
  { href: "/usluge", messageKey: "services" },
  { href: "/clanarine-i-cijene", messageKey: "pricing" },
  { href: "/rezervacija-termina", messageKey: "schedule" },
  { href: "/partneri", messageKey: "partners" },
  { href: "/kontakt", messageKey: "contact" },
];

export function Footer({ info }: { info: SiteInfo }) {
  const t = useTranslations();
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy-950 text-white/80">
      <VertebraeDivider className="h-3 w-full text-navy-500/40" />

      <Container className="flex flex-col items-center gap-8 py-16 text-center">
        <Logo variant="white" />
        <p className="-mt-4 font-display text-sm uppercase tracking-wide text-accent-500">
          {t("footer.tagline")}
        </p>

        <nav
          aria-label={t("footer.navTitle")}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/75 transition-colors hover:text-white"
            >
              {tNav(link.messageKey)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/75">
          <a href={info.phoneHref} className="flex items-center gap-2 transition-colors hover:text-white">
            <Phone className="size-4 shrink-0 text-accent-500" aria-hidden />
            {info.phone}
          </a>
          <a
            href={info.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <MapPin className="size-4 shrink-0 text-accent-500" aria-hidden />
            {info.address.street}, {info.address.city}
          </a>
          <span className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-accent-500" aria-hidden />
            {info.hours.opens}–{info.hours.closes}
          </span>
          <a
            href={info.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <InstagramIcon className="size-4 shrink-0 text-accent-500" aria-hidden />
            {info.instagramHandle}
          </a>
        </div>
      </Container>

      <div className="border-t border-white/10 py-8">
        <Container className="flex flex-col items-center gap-4 text-center text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <p>
              © {year} {BUSINESS.name}. {t("footer.rights")}
            </p>
            <span aria-hidden className="text-white/30">
              ·
            </span>
            <Link href="/politika-privatnosti" className="transition-colors hover:text-white">
              {t("footer.privacy")}
            </Link>
            <span aria-hidden className="text-white/30">
              ·
            </span>
            <Link href="/uslovi-koristenja" className="transition-colors hover:text-white">
              {t("footer.terms")}
            </Link>
          </div>

          <a
            href="https://devet.ba"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3"
          >
            <span className="text-xs uppercase tracking-wide text-white/50 transition-colors group-hover:text-white/75">
              {t("footer.madeBy")}
            </span>
            <span aria-hidden className="h-4 w-px bg-white/15" />
            <Image
              src="/brand/logo-devet-white.svg"
              alt="Studio Devet"
              width={140}
              height={77}
              className="h-6 w-auto opacity-90 transition-opacity group-hover:opacity-100"
            />
          </a>
        </Container>
      </div>
    </footer>
  );
}
