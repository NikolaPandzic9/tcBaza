import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getStartingPriceLabel } from "@/content/programs";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";
import { getProgramPage } from "@/server/site/content";

const SLUG = "sportski-pasos" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";
  const page = await getProgramPage(SLUG);
  if (!page) return {};
  const priceLabel = getStartingPriceLabel(page.program, locale);

  return buildPageMetadata({
    locale,
    path: page.program.href,
    title: isBs
      ? "Sportski pasoš — sportski program za djecu"
      : "Sports Passport — a sports program for kids",
    description: isBs
      ? `Program za djecu: kroz igru i sport razvijaju motoriku, snagu, brzinu i koordinaciju. Svaki mjesec nova disciplina. Cijena ${priceLabel}, Istočno Sarajevo.`
      : `A kids program: through play and sport they build motor skills, strength, speed, and coordination. A new sport every month. Priced ${priceLabel}, Istočno Sarajevo.`,
  });
}

export default async function SportskiPasosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  // Hidden in the ERP → the page is gone until it's shown again.
  const page = await getProgramPage(SLUG);
  if (!page) notFound();

  return (
    <ProgramDetailTemplate
      program={page.program}
      detail={page.detail}
      locale={locale}
      info={page.content.info}
    />
  );
}
