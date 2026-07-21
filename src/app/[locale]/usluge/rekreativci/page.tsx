import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { getProgram, getStartingPriceLabel } from "@/content/programs";
import { PROGRAM_DETAILS } from "@/content/programDetails";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";

const SLUG = "rekreativci" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const program = getProgram(SLUG);
  const priceLabel = getStartingPriceLabel(program, locale);

  return {
    title:
      locale === "bs"
        ? `Rekreativci — grupni treninzi ${priceLabel}`
        : `Recreational — group training ${priceLabel}`,
    description: program.shortPitch[locale],
  };
}

export default async function RekreativciPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  setRequestLocale(locale);

  return (
    <ProgramDetailTemplate
      program={getProgram(SLUG)}
      detail={PROGRAM_DETAILS[SLUG]}
      locale={locale}
    />
  );
}
