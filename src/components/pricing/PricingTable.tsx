import type { Locale } from "@/i18n/routing";
import type { PricingTier } from "@/content/programs";

interface PricingTableProps {
  tiers: PricingTier[];
  locale: Locale;
}

export function PricingTable({ tiers, locale }: PricingTableProps) {
  return (
    <div className="grid gap-3">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className="flex flex-wrap items-center justify-between gap-3 clip-corner bg-white px-6 py-5 shadow-sm ring-1 ring-charcoal-200 transition-shadow hover:shadow-md"
        >
          <div>
            <p className="font-semibold text-navy-900">{tier.label[locale]}</p>
            {tier.sessionsPerWeek && (
              <p className="mt-0.5 text-xs text-charcoal-500">
                {locale === "bs"
                  ? `${tier.sessionsPerWeek} treninga sedmično`
                  : `${tier.sessionsPerWeek} sessions per week`}
              </p>
            )}
          </div>
          {tier.price ? (
            <p className="font-display text-lg text-navy-700">
              {tier.price.amount}{" "}
              <span className="text-sm text-charcoal-500">
                {tier.price.period[locale]}
              </span>
            </p>
          ) : (
            <p className="font-display text-sm uppercase tracking-wide text-accent-ink-700">
              {locale === "bs" ? "Cijena na upit" : "Price on request"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
