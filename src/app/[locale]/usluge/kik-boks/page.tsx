import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/i18n/resolveLocale";
import { getProgram } from "@/content/programs";
import { PROGRAM_DETAILS } from "@/content/programDetails";
import { ProgramDetailTemplate } from "@/components/programs/ProgramDetailTemplate";

const SLUG = "kik-boks" as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const program = getProgram(SLUG);

  return {
    title:
      locale === "bs"
        ? "Kik boks — treninzi u saradnji sa KBK Slavija"
        : "Kickboxing — sessions with Kik boks klub Slavija",
    description: program.shortPitch[locale],
  };
}

export default async function KikBoksPage({
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
