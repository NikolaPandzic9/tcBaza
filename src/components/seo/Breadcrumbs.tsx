import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale, Pathnames } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

interface Crumb {
  label: string;
  href: Pathnames;
}

interface BreadcrumbsProps {
  items: Crumb[];
  locale: Locale;
}

/** Visible trail + matching BreadcrumbList JSON-LD. The home crumb is
 * prepended here so no call site can forget it. */
export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  const trail: Crumb[] = [
    { label: locale === "bs" ? "Početna" : "Home", href: "/" },
    ...items,
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: localizedUrl(item.href, locale),
    })),
  };

  return (
    <nav aria-label={locale === "bs" ? "Putanja" : "Breadcrumb"} className="py-4">
      <JsonLd data={schema} />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-charcoal-500">
        {trail.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3" aria-hidden />}
            {index === trail.length - 1 ? (
              <span aria-current="page" className="font-medium text-charcoal-700">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="underline-offset-2 hover:text-navy-700 hover:underline">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
