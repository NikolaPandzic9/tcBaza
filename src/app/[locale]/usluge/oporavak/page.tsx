import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { RECOVERY_INTRO } from "@/content/recovery";
import { getSiteContent } from "@/server/site/content";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { VertebraeDivider } from "@/components/ui/VertebraeDivider";
import { RecoveryServiceCard } from "@/components/recovery/RecoveryServiceCard";
import { buildServiceSchema } from "@/lib/serviceSchema";

// Stock photo (no real client photo exists for recovery services) — see
// HANDOVER.md for the source/photographer to swap this out later.
const RECOVERY_IMAGE: { src: string; alt: { bs: string; en: string } } = {
  src: "/photos/stock/recovery-massage.jpg",
  alt: {
    bs: "Sportska masaža za oporavak mišića",
    en: "Sports massage for muscle recovery",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/usluge/oporavak",
    title: isBs ? "Masaža i oporavak — hladna kupka, čizme" : "Massage & recovery — cold plunge, boots",
    description: isBs
      ? "Masaža, hladna kupka i kompresivne čizme za brži oporavak mišića — od 15 KM, uz povoljnije cijene za članove. Trening centar Baza, Istočno Sarajevo."
      : "Massage, cold plunge, and compression boots for faster muscle recovery — from 15 KM, with lower prices for members. Trening centar Baza, Istočno Sarajevo.",
  });
}

export default async function OporavakPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const content = await getSiteContent();

  const t = { services: locale === "bs" ? "Usluge" : "Services" };

  const schema = buildServiceSchema({
    name: locale === "bs" ? "Masaža i oporavak" : "Massage and recovery",
    description: RECOVERY_INTRO.body[locale],
    path: "/usluge/oporavak",
    locale,
    offers: content.recovery.flatMap((service) =>
      service.prices.map((price) => ({
        name: `${service.name[locale]} — ${price.label[locale]}`,
        price: price.amount,
        monthly: false,
      })),
    ),
  });

  return (
    <main className="bg-navy-50">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs
          locale={locale}
          items={[
            { label: t.services, href: "/usluge" },
            { label: locale === "bs" ? "Oporavak" : "Recovery", href: "/usluge/oporavak" },
          ]}
        />
      </Container>

      <section className="pb-16 pt-4 sm:pb-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionEyebrow>{RECOVERY_INTRO.eyebrow[locale]}</SectionEyebrow>
            <h1 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl lg:text-5xl">
              {RECOVERY_INTRO.headline[locale]}
            </h1>
            <p className="mt-5 text-lg text-charcoal-500">{RECOVERY_INTRO.body[locale]}</p>
          </div>

          {RECOVERY_IMAGE ? (
            <div className="relative aspect-[4/5] w-full clip-corner-lg overflow-hidden bg-navy-900">
              <Image
                src={RECOVERY_IMAGE.src}
                alt={RECOVERY_IMAGE.alt[locale]}
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

      <section className="bg-white py-16 sm:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {content.recovery.map((service) => (
              <RecoveryServiceCard key={service.slug} service={service} locale={locale} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
