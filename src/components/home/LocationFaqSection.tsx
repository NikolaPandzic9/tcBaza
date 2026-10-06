import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { LOCATION } from "@/content/home";
import type { FaqItem } from "@/content/programDetails";
import type { SiteInfo } from "@/lib/siteInfo";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { FaqSection } from "@/components/seo/FaqSection";
import { cn } from "@/lib/cn";

interface LocationFaqSectionProps {
  locale: Locale;
  info: SiteInfo;
  faq: FaqItem[];
}

/**
 * Address, hours, and service area in visible text (the local-SEO signals
 * search engines cross-check against the business profile), next to the
 * questions people ask before their first visit.
 */
export function LocationFaqSection({ locale, info, faq }: LocationFaqSectionProps) {
  return (
    <section className="bg-navy-50 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="clip-corner-lg bg-navy-700 p-7 text-white sm:p-8">
            <SectionEyebrow tone="onDark">{LOCATION.eyebrow[locale]}</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight">
              {LOCATION.headline[locale]}
            </h2>

            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="size-5 shrink-0 text-accent-500" aria-hidden />
                <address className="not-italic">
                  {info.address.street}
                  <br />
                  {info.address.city}, {info.address.country}
                </address>
              </li>
              <li className="flex gap-3">
                <Clock className="size-5 shrink-0 text-accent-500" aria-hidden />
                <span>
                  {LOCATION.hoursLabel[locale]} {info.hours.opens}–{info.hours.closes}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="size-5 shrink-0 text-accent-500" aria-hidden />
                <a href={info.phoneHref} className="hover:text-accent-500">
                  {info.phone}
                </a>
              </li>
            </ul>

            <p className="mt-6 text-sm text-white/70">{LOCATION.serviceArea[locale]}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={info.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonBaseClasses, buttonVariantClasses.secondary)}
              >
                <Navigation className="size-4" aria-hidden />
                {locale === "bs" ? "Otvori u mapama" : "Open in Maps"}
              </a>
              <a
                href={info.phoneHref}
                className={cn(
                  buttonBaseClasses,
                  "bg-transparent text-white ring-1 ring-inset ring-white/40 hover:bg-white/10",
                )}
              >
                <Phone className="size-4" aria-hidden />
                {locale === "bs" ? "Pozovi" : "Call"}
              </a>
            </div>
          </div>
        </div>

        {faq.length > 0 && (
          <FaqSection items={faq} locale={locale} className="lg:col-span-3" />
        )}
      </Container>
    </section>
  );
}
