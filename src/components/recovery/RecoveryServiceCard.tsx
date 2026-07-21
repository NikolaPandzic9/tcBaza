import type { Locale } from "@/i18n/routing";
import type { RecoveryService } from "@/content/recovery";

interface RecoveryServiceCardProps {
  service: RecoveryService;
  locale: Locale;
}

export function RecoveryServiceCard({ service, locale }: RecoveryServiceCardProps) {
  return (
    <div className="clip-corner-lg bg-white p-6 shadow-sm ring-1 ring-charcoal-200 transition-shadow hover:shadow-md sm:p-8">
      <h3 className="font-display text-lg uppercase tracking-wide text-navy-900">
        {service.name[locale]}
      </h3>
      {service.duration && (
        <p className="mt-1 text-xs text-charcoal-500">{service.duration[locale]}</p>
      )}

      <dl className="mt-5 divide-y divide-charcoal-100 border-t border-charcoal-100">
        {service.prices.map((price) => (
          <div
            key={price.label.bs}
            className="flex items-center justify-between gap-4 py-2.5 text-sm"
          >
            <dt className="text-charcoal-500">{price.label[locale]}</dt>
            <dd className="whitespace-nowrap font-semibold text-navy-700">
              {price.amount} KM
            </dd>
          </div>
        ))}
      </dl>

      {service.benefits.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {service.benefits.map((benefit) => (
            <li
              key={benefit.bs}
              className="bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-ink-700"
            >
              {benefit[locale]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
