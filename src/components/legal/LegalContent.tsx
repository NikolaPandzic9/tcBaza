import type { Locale } from "@/i18n/routing";
import type { LegalSection } from "@/content/legal";

interface LegalContentProps {
  title: string;
  updatedLabel: string;
  sections: LegalSection[];
  locale: Locale;
}

export function LegalContent({ title, updatedLabel, sections, locale }: LegalContentProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-navy-900 sm:text-5xl">
        {title}
      </h1>
      <span aria-hidden className="clip-corner mt-4 block h-1.5 w-16 bg-accent-500" />
      <p className="mt-4 text-sm text-charcoal-500">{updatedLabel}</p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading.bs}>
            <h2 className="font-display text-lg uppercase tracking-wide text-navy-900">
              {section.heading[locale]}
            </h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph) => (
                <p key={paragraph.bs} className="text-sm leading-relaxed text-charcoal-700">
                  {paragraph[locale]}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
