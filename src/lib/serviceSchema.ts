import type { Program } from "@/content/programs";
import { BUSINESS, SITE_URL } from "./constants";

export function getServiceSchema(program: Program, locale: "bs" | "en") {
  const offers = program.tiers
    .filter((tier) => tier.price !== null)
    .map((tier) => ({
      "@type": "Offer",
      name: tier.label[locale],
      price: tier.price!.amount,
      priceCurrency: "BAM",
      url: `${SITE_URL}${program.href}`,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: program.name[locale],
    name: program.name[locale],
    description: program.shortPitch[locale],
    provider: {
      "@type": "HealthClub",
      name: BUSINESS.name,
    },
    areaServed: BUSINESS.address.city,
    ...(offers.length > 0 ? { offers } : {}),
  };
}
