import type { Metadata } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyCallCta } from "@/components/layout/StickyCallCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { resolveLocale } from "@/i18n/resolveLocale";
import { routing } from "@/i18n/routing";
import { getHealthClubSchema } from "@/lib/businessSchema";
import { BUSINESS, SITE_URL } from "@/lib/constants";
import "../globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const isBs = locale === "bs";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${BUSINESS.name} — ${BUSINESS.legalSlogan}`,
      template: `%s — ${BUSINESS.name}`,
    },
    description: isBs
      ? "Personalizovani grupni treninzi u malim grupama do 5 članova, priprema sportista i programi oporavka u Istočnom Sarajevu."
      : "Personalized small-group training (max 5 members per group), athlete preparation, and recovery programs in Istočno Sarajevo, Bosnia and Herzegovina.",
    alternates: {
      languages: {
        bs: "/",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);

  // Enables static rendering for this locale segment.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${anton.variable} ${jakarta.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-navy-50 pb-14 font-body text-charcoal-700 antialiased sm:pb-0">
        <NextIntlClientProvider>
          <JsonLd data={getHealthClubSchema()} />
          <Header />
          {children}
          <Footer />
          <StickyCallCta />
          <CookieConsentBanner />
          <GoogleAnalytics />
          <MetaPixel />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
