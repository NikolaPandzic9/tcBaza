import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { buildPageMetadata } from "@/lib/seo";
import { getStartingPriceLabel } from "@/content/programs";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";
import { getProgramPage } from "@/server/site/content";

const SLUG = "rekreativci" as const;

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
    title: isBs ? "Grupni treninzi za rekreativce" : "Recreational small-group training",
    description: isBs
      ? `Personalizovani grupni treninzi do 5 članova: individualni plan nakon testiranja i trener na svakom treningu. Cijena ${priceLabel}, Istočno Sarajevo.`
      : `Personalized small-group training (max 5): an individual plan after assessment and a trainer at every session. Priced ${priceLabel}, Istočno Sarajevo.`,
  });
}

export default async function RekreativciPage({
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
