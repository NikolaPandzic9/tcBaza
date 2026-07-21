import type { Locale } from "@/i18n/routing";
import type { TerminStatus } from "@/sanity/types";
import { StatusBadge } from "./StatusBadge";

const STATUSES: TerminStatus[] = ["Slobodno", "Uskoro", "Popunjeno", "Otkazano"];

export function StatusLegend({ locale }: { locale: Locale }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => (
        <StatusBadge key={status} status={status} locale={locale} />
      ))}
    </div>
  );
}
