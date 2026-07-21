import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Pathnames } from "@/i18n/routing";
import { SITE_URL } from "@/lib/constants";
import { JsonLd } from "./JsonLd";

interface Crumb {
  label: string;
  href: Pathnames;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <JsonLd data={schema} />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-charcoal-500">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3" aria-hidden />}
            {index === items.length - 1 ? (
              <span className="font-medium text-charcoal-700">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-navy-700">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
