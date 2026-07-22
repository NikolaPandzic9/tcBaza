import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

interface ScheduleSectionTabsProps {
  active: "grupni" | "komercijalna";
  locale: Locale;
}

// The two termini subpages are independent routes (not a client-side
// toggle) so each keeps its own metadata/SSR data fetch — this is just a
// visual pairing so visitors don't miss the sibling page.
export function ScheduleSectionTabs({ active, locale }: ScheduleSectionTabsProps) {
  const tabs = [
    {
      key: "grupni" as const,
      href: "/rezervacija-termina" as const,
      label: locale === "bs" ? "Grupni treninzi" : "Group training",
    },
    {
      key: "komercijalna" as const,
      href: "/rezervacija-termina/komercijalna-teretana" as const,
      label: locale === "bs" ? "Komercijalna teretana" : "Commercial gym",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={tab.key === active ? "page" : undefined}
          className={cn(
            "clip-corner px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
            tab.key === active
              ? "bg-navy-700 text-white"
              : "bg-white text-charcoal-500 ring-1 ring-charcoal-200 hover:text-navy-700",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
