import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { PRIVACY_POLICY } from "@/content/legal";
import { Container } from "@/components/ui/Container";
import { LegalContent } from "@/components/legal/LegalContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return buildPageMetadata({
    locale,
    path: "/politika-privatnosti",
    title: isBs ? "Politika privatnosti" : "Privacy Policy",
    description: isBs
      ? "Kako Trening centar Baza prikuplja, koristi i štiti lične podatke posjetilaca sajta i članova."
      : "How Trening centar Baza collects, uses, and protects the personal data of site visitors and members.",
  });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  return (
    <main className="bg-navy-50 pb-20 pt-10 sm:pb-28 sm:pt-14">
      <Container>
        <LegalContent
          title={locale === "bs" ? "Politika privatnosti" : "Privacy Policy"}
          updatedLabel={locale === "bs" ? "Posljednje ažurirano: 2026" : "Last updated: 2026"}
          sections={PRIVACY_POLICY}
          locale={locale}
        />
      </Container>
    </main>
  );
}
