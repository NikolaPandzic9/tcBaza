import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import type { Locale, Pathnames } from "@/i18n/routing";
import { BUSINESS, SITE_URL } from "./constants";

/** Absolute, locale-correct URL for a route — e.g. /en/services/athletes. */
export function localizedUrl(href: Pathnames, locale: Locale): string {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

/**
 * The dynamic image from app/[locale]/opengraph-image.tsx. Referenced
 * explicitly because a page that sets its own `openGraph` replaces the
 * layout's — including the file-based image — rather than merging into it.
 */
function ogImageUrl(locale: Locale): string {
  return `${SITE_URL}${locale === "bs" ? "" : "/en"}/opengraph-image`;
}

const OG_LOCALE: Record<Locale, string> = { bs: "bs_BA", en: "en_US" };

interface PageMetadataInput {
  locale: Locale;
  path: Pathnames;
  title: string;
  description: string;
  /** Skip the "| Trening centar Baza" suffix (home page, where the brand
   * already leads the title). */
  absoluteTitle?: boolean;
}

/**
 * One place for everything search engines and link previews read per
 * page: title, description, canonical, hreflang alternates (bs/en +
 * x-default), Open Graph and Twitter Card. Every route's generateMetadata
 * goes through this so none of them can drift out of sync.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const url = localizedUrl(path, locale);
  const fullTitle = absoluteTitle ? title : `${title} | ${BUSINESS.name}`;
  const image = {
    url: ogImageUrl(locale),
    width: 1200,
    height: 630,
    alt: BUSINESS.name,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        bs: localizedUrl(path, "bs"),
        en: localizedUrl(path, "en"),
        "x-default": localizedUrl(path, "bs"),
      },
    },
    openGraph: {
      type: "website",
      siteName: BUSINESS.name,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "bs" ? "en" : "bs"],
      url,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
    },
  };
}
