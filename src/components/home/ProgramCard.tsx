import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Program } from "@/content/programs";

interface ProgramCardProps {
  program: Program;
  locale: Locale;
  priceLabel: string;
}

export function ProgramCard({ program, locale, priceLabel }: ProgramCardProps) {
  return (
    <Link
      href={program.href}
      className="group clip-corner-lg flex h-full flex-col justify-between bg-navy-700 p-6 text-white transition-colors hover:bg-navy-900 sm:p-7"
    >
      <div>
        <h3 className="font-display text-xl uppercase tracking-wide">
          {program.name[locale]}
        </h3>
        <p className="mt-3 text-sm text-white/70">{program.shortPitch[locale]}</p>
      </div>
      <div className="mt-8 flex items-end justify-between">
        <span className="font-display text-sm uppercase tracking-wide text-accent-500">
          {priceLabel}
        </span>
        <ArrowUpRight
          className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}
