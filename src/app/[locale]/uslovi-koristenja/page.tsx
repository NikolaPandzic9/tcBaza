import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { TERMS_OF_USE } from "@/content/legal";
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
    path: "/uslovi-koristenja",
    title: isBs ? "Uslovi korištenja" : "Terms of Use",
    description: isBs
      ? "Uslovi korištenja sajta Trening centra Baza."
      : "Terms of use for the Trening centar Baza website.",
  });
}

export default async function TermsOfUsePage({
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
          title={locale === "bs" ? "Uslovi korištenja" : "Terms of Use"}
          updatedLabel={locale === "bs" ? "Posljednje ažurirano: 2026" : "Last updated: 2026"}
          sections={TERMS_OF_USE}
          locale={locale}
        />
      </Container>
    </main>
  );
}
