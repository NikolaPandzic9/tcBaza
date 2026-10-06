import type { Locale, Pathnames } from "@/i18n/routing";
import type { Program } from "@/content/programs";
import type { FaqItem } from "@/content/programDetails";
import { BUSINESS } from "./constants";
import type { SiteInfo } from "./siteInfo";
import {
  getAreaServed,
  getPostalAddress,
  getProviderRef,
} from "./businessSchema";
import { localizedUrl } from "./seo";

interface OfferInput {
  name: string;
  price: number;
  /** Monthly memberships carry a unit price; one-off services don't. */
  monthly: boolean;
}

interface ServiceSchemaInput {
  name: string;
  description: string;
  path: Pathnames;
  locale: Locale;
  offers: OfferInput[];
  audience?: string;
}

export function buildServiceSchema({
  name,
  description,
  path,
  locale,
  offers,
  audience,
}: ServiceSchemaInput) {
  const url = localizedUrl(path, locale);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: name,
    name,
    description,
    url,
    provider: getProviderRef(),
    areaServed: getAreaServed(),
    ...(audience ? { audience: { "@type": "PeopleAudience", audienceType: audience } } : {}),
    ...(offers.length > 0
      ? {
          offers: offers.map((offer) => ({
            "@type": "Offer",
            name: offer.name,
            price: offer.price,
            priceCurrency: "BAM",
            availability: "https://schema.org/InStock",
            url,
            ...(offer.monthly
              ? {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: offer.price,
                    priceCurrency: "BAM",
                    unitCode: "MON",
                    unitText: locale === "bs" ? "mjesečno" : "per month",
                  },
                }
              : {}),
          })),
        }
      : {}),
  };
}

const AUDIENCE: Partial<Record<Program["slug"], { bs: string; en: string }>> = {
  "sportski-pasos": { bs: "Djeca", en: "Children" },
  sportisti: { bs: "Sportisti", en: "Athletes" },
};

/**
 * Service schema for every program, plus a Course node for the kids'
 * program — a structured, month-by-month curriculum is closer to a course
 * than to a plain membership, and it's the type search engines use for
 * kids' activity listings.
 */
export function getProgramSchemas(program: Program, locale: Locale, info: SiteInfo) {
  const audience = AUDIENCE[program.slug]?.[locale];
  const pricedTiers = program.tiers.filter(
    (tier): tier is typeof tier & { price: NonNullable<typeof tier.price> } =>
      tier.price !== null,
  );

  const schemas: Record<string, unknown>[] = [
    buildServiceSchema({
      name: program.name[locale],
      description: program.shortPitch[locale],
      path: program.href,
      locale,
      audience,
      offers: pricedTiers.map((tier) => ({
        name: tier.label[locale],
        price: tier.price.amount,
        monthly: true,
      })),
    }),
  ];

  if (program.slug === "sportski-pasos") {
    const url = localizedUrl(program.href, locale);
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${url}#course`,
      name: program.name[locale],
      description: program.shortPitch[locale],
      url,
      inLanguage: "bs",
      provider: getProviderRef(),
      audience: { "@type": "EducationalAudience", audienceType: audience },
      offers: pricedTiers.map((tier) => ({
        "@type": "Offer",
        category: "Subscription",
        price: tier.price.amount,
        priceCurrency: "BAM",
        availability: "https://schema.org/LimitedAvailability",
        url,
      })),
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Onsite",
        location: {
          "@type": "Place",
          name: BUSINESS.name,
          address: getPostalAddress(info),
        },
      },
    });
  }

  return schemas;
}

export function getFaqSchema(items: FaqItem[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question[locale],
      acceptedAnswer: { "@type": "Answer", text: item.answer[locale] },
    })),
  };
}
