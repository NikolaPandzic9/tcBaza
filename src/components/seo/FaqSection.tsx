import { Plus } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { FaqItem } from "@/content/programDetails";
import { getFaqSchema } from "@/lib/serviceSchema";
import { cn } from "@/lib/cn";
import { JsonLd } from "./JsonLd";

interface FaqSectionProps {
  items: FaqItem[];
  locale: Locale;
  title?: string;
  className?: string;
}

/**
 * Native <details>/<summary>: keyboard- and screen-reader-accessible with
 * zero JS, and the answers stay in the HTML for crawlers. The FAQPage
 * JSON-LD is emitted from the same array, so it can never drift from
 * what's on screen.
 */
export function FaqSection({ items, locale, title, className }: FaqSectionProps) {
  return (
    <div className={className}>
      <JsonLd data={getFaqSchema(items, locale)} />
      <h2 className="font-display text-xl uppercase tracking-wide text-navy-900">
        {title ?? (locale === "bs" ? "Česta pitanja" : "FAQ")}
      </h2>
      <div className="mt-6 divide-y divide-charcoal-200 border-y border-charcoal-200">
        {items.map((item) => (
          <details key={item.question.bs} className="group">
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-navy-900",
                "transition-colors hover:text-navy-700 [&::-webkit-details-marker]:hidden",
              )}
            >
              {item.question[locale]}
              <Plus
                className="size-4 shrink-0 text-accent-ink-700 transition-transform duration-200 group-open:rotate-45"
                aria-hidden
              />
            </summary>
            <p className="pb-5 pr-8 text-sm text-charcoal-500">{item.answer[locale]}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
