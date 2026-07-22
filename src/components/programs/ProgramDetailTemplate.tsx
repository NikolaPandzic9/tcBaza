import { Check } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import type { Program } from "@/content/programs";
import type { ProgramDetail } from "@/content/programDetails";
import { BookingContactMenu } from "@/components/contact/BookingContactMenu";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { buttonBaseClasses, buttonVariantClasses } from "@/components/ui/buttonStyles";
import { PricingTable } from "@/components/pricing/PricingTable";
import { getServiceSchema } from "@/lib/serviceSchema";
import { cn } from "@/lib/cn";

interface ProgramDetailTemplateProps {
  program: Program;
  detail: ProgramDetail;
  locale: Locale;
}

export function ProgramDetailTemplate({
  program,
  detail,
  locale,
}: ProgramDetailTemplateProps) {
  const t = {
    services: locale === "bs" ? "Usluge" : "Services",
    quiz: locale === "bs" ? "Pronađi svoj program" : "Find your program",
  };

  return (
    <main className="bg-navy-50">
      <JsonLd data={getServiceSchema(program, locale)} />
      <Container>
        <Breadcrumbs
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
            <div className="relative flex aspect-[4/5] w-full items-center justify-center clip-corner-lg bg-navy-700">
              <VertebraeDivider className="h-16 w-2/3 text-white/20" />
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
          </div>
        </Container>
      </section>
    </main>
  );
}
