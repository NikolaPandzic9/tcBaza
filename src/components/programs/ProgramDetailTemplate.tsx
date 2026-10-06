import { Check, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { getStartingPriceLabel, type Program } from "@/content/programs";
import type { ProgramDetail } from "@/content/programDetails";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { PricingTable } from "@/components/pricing/PricingTable";
import type { SiteInfo } from "@/lib/siteInfo";
import { getProgramSchemas } from "@/lib/serviceSchema";
import { cn } from "@/lib/cn";

interface ProgramDetailTemplateProps {
  program: Program;
  detail: ProgramDetail;
  locale: Locale;
  info: SiteInfo;
}

export function ProgramDetailTemplate({
  program,
  detail,
  locale,
  info,
}: ProgramDetailTemplateProps) {
  const t = {
    services: locale === "bs" ? "Usluge" : "Services",
    quiz: locale === "bs" ? "Pronađi svoj program" : "Find your program",
    where: locale === "bs" ? "Gdje treniramo" : "Where we train",
    directions: locale === "bs" ? "Otvori u mapama" : "Open in Maps",
  };

  return (
    <main className="bg-navy-50">
      <JsonLd data={getProgramSchemas(program, locale, info)} />
      <Container>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: t.services, href: "/usluge" },
            { label: program.name[locale], href: program.href },
          ]}
        />
      </Container>

      <section className="pb-16 pt-4 sm:pb-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionEyebrow>{t.services}</SectionEyebrow>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
              {program.name[locale]}
            </h1>
            <span aria-hidden className="clip-corner mt-5 block h-1.5 w-20 bg-accent-500" />
            <p className="mt-6 text-lg text-charcoal-500">
              {detail.longDescription[locale]}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={locale === "bs" ? "/#kviz" : "/en#kviz"}
                className={cn(buttonBaseClasses, buttonVariantClasses.secondary)}
              >
                {t.quiz}
              </a>
              <BookingContactMenu locale={locale} variant="ghost" />
            </div>
          </div>

          {detail.image ? (
            <div className="relative aspect-[4/5] w-full clip-corner-lg overflow-hidden bg-navy-900">
              <Image
                src={detail.image.src}
                alt={detail.image.alt[locale]}
                fill
                sizes="(min-width: 1024px) 42vw, 90vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center gap-6 overflow-hidden clip-corner-lg bg-navy-700 p-8 text-center">
              <VertebraeDivider className="pointer-events-none absolute inset-x-0 top-1/2 h-16 w-full -translate-y-1/2 text-white/10" />
              <p className="relative font-display text-4xl uppercase leading-none text-white sm:text-5xl">
                {program.name[locale]}
              </p>
              <span aria-hidden className="clip-corner relative block h-1.5 w-16 bg-accent-500" />
              <p className="relative font-display text-lg uppercase tracking-wide text-accent-500">
                {getStartingPriceLabel(program, locale)}
              </p>
            </div>
          )}
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wide text-navy-900">
              {locale === "bs" ? "Šta dobijaš" : "What you get"}
            </h2>
            <ul className="mt-6 space-y-3">
              {detail.features.map((feature) => (
                <li key={feature.bs} className="flex items-start gap-2.5 text-sm text-charcoal-700">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-ink-700" aria-hidden />
                  {feature[locale]}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl uppercase tracking-wide text-navy-900">
              {locale === "bs" ? "Cijena" : "Pricing"}
            </h2>
            <div className="mt-6">
              <PricingTable tiers={program.tiers} locale={locale} />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 clip-corner bg-navy-50 px-6 py-5 ring-1 ring-charcoal-200">
              <p className="flex items-start gap-3 text-sm text-charcoal-700">
                <MapPin className="mt-0.5 size-5 shrink-0 text-accent-ink-700" aria-hidden />
                <span>
                  <span className="block font-semibold text-navy-900">{t.where}</span>
                  {info.address.street}, {info.address.city}
                </span>
              </p>
              <a
                href={info.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:text-navy-900"
              >
                <Navigation className="size-3.5" aria-hidden />
                {t.directions}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {detail.faq && detail.faq.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container className="max-w-3xl">
            <FaqSection items={detail.faq} locale={locale} />
          </Container>
        </section>
      )}
    </main>
  );
}
