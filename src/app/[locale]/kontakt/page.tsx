import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfoCard } from "@/components/contact/ContactInfoCard";
import { MapEmbed } from "@/components/contact/MapEmbed";
import { BUSINESS } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title: locale === "bs" ? "Kontakt" : "Contact",
    description:
      locale === "bs"
        ? `Javi se Trening centru Baza — ${BUSINESS.address.street}, ${BUSINESS.address.city}.`
        : `Get in touch with Trening centar Baza — ${BUSINESS.address.street}, ${BUSINESS.address.city}.`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

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
            <ContactInfoCard locale={locale} />
            <MapEmbed title={BUSINESS.name} />
          </div>
        </div>
      </Container>
    </main>
  );
}
