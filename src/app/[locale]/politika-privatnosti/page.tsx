import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { PRIVACY_POLICY } from "@/content/legal";
import { Container } from "@/components/ui/Container";
import { LegalContent } from "@/components/legal/LegalContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    title: locale === "bs" ? "Politika privatnosti" : "Privacy Policy",
    robots: { index: true, follow: true },
  };
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
