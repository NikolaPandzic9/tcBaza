import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfoCard } from "@/components/contact/ContactInfoCard";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { BUSINESS } from "@/lib/constants";
import { getSiteContent } from "@/server/site/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";
  const { info } = await getSiteContent();

  return buildPageMetadata({
    locale,
    path: "/kontakt",
    title: isBs ? "Kontakt i lokacija" : "Contact & location",
    description: isBs
      ? `Pozovi ${info.phone} ili piši na WhatsApp i Instagram. ${info.address.street}, ${info.address.city} — otvoreno svaki dan ${info.hours.opens}–${info.hours.closes}.`
      : `Call ${info.phone} or message us on WhatsApp or Instagram. ${info.address.street}, ${info.address.city} — open every day ${info.hours.opens}–${info.hours.closes}.`,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);
  const content = await getSiteContent();

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <PageHeader
          eyebrow={locale === "bs" ? "Kontakt" : "Contact"}
          title={locale === "bs" ? "Javi nam se" : "Get in touch"}
          description={
            locale === "bs"
              ? "Pitanje o programima, terminima ili cijenama? Pozovi direktno ili pošalji poruku ispod."
              : "Question about programs, schedules, or pricing? Call directly or send a message below."
          }
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm locale={locale} />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ContactInfoCard locale={locale} info={content.info} />
            <MapEmbed title={BUSINESS.name} info={content.info} />
          </div>
        </div>
      </Container>
    </main>
  );
}
