import type { Locale } from "@/i18n/routing";
import type { Program } from "@/content/programs";
import { BUSINESS, SERVICE_AREAS, SITE_URL } from "./constants";
import { localizedUrl } from "./seo";
import type { SiteInfo } from "./siteInfo";

/** Stable node id, so every Service/Course/WebSite on the site can point
 * at the same business entity instead of re-describing it. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function getPostalAddress(info: SiteInfo) {
  return {
    "@type": "PostalAddress",
    streetAddress: info.address.street,
    addressLocality: info.address.city,
    addressRegion: "Republika Srpska",
    addressCountry: info.address.countryCode,
  };
}

export function getAreaServed() {
  return SERVICE_AREAS.map((name) => ({ "@type": "City", name }));
}

/** Short reference for nesting inside other nodes. */
export function getProviderRef() {
  return { "@type": "HealthClub", "@id": ORGANIZATION_ID, name: BUSINESS.name };
}

/**
 * HealthClub (a schema.org LocalBusiness subtype) rather than a bare
 * LocalBusiness — a closer match for coached group training + recovery
 * services. Every field here is real client data; nothing invented
 * (no AggregateRating or geo coordinates — not supplied yet).
 */
export function getSiteSchema(locale: Locale, { info, programs }: { info: SiteInfo; programs: Program[] }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HealthClub",
        "@id": ORGANIZATION_ID,
        name: BUSINESS.name,
        alternateName: ["TC Baza", "BAZA Training Centar", "Baza Istočno Sarajevo"],
        slogan: BUSINESS.legalSlogan,
        description:
          locale === "bs"
            ? "Trening centar u Istočnom Sarajevu: personalizovani grupni treninzi do 5 članova, kondiciona priprema sportista, Sportski pasoš za djecu, teretana i sportska masaža."
            : "A training center in Istočno Sarajevo: personalized group training (max 5 per group), athlete conditioning, the Sports Passport program for kids, open gym access, and sports massage.",
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
        image: `${SITE_URL}/photos/hero-gym-interior.jpg`,
        telephone: info.phone,
        priceRange: "50–200 KM",
        currenciesAccepted: "BAM",
        address: getPostalAddress(info),
        hasMap: info.mapsUrl,
        areaServed: getAreaServed(),
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: info.hours.opens,
          closes: info.hours.closes,
        },
        ...(info.email ? { email: info.email } : {}),
        sameAs: info.instagramUrl ? [info.instagramUrl] : [],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: locale === "bs" ? "Programi i usluge" : "Programs and services",
          itemListElement: programs.map((program) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: program.name[locale],
              url: localizedUrl(program.href, locale),
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BUSINESS.name,
        inLanguage: ["bs", "en"],
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
