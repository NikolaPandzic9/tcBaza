import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { INSTAGRAM_TEASER } from "@/content/home";
import type { SiteInfo } from "@/lib/siteInfo";
import { Container } from "@/components/ui/Container";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

const PREVIEW_PHOTOS = [
  {
    src: "/photos/strength-training-1.jpg",
    alt: { bs: "Trening snage u Bazi", en: "Strength training at Baza" },
  },
  {
    src: "/photos/strength-training-2.jpg",
    alt: { bs: "Oprema u teretani Baze", en: "Gym equipment at Baza" },
  },
  {
    src: "/photos/testing-trainer-client.jpg",
    alt: { bs: "Trener radi sa članom u Bazi", en: "A trainer working with a member at Baza" },
  },
  {
    src: "/photos/about-gym-mural.jpg",
    alt: { bs: "Mural u Trening centru Baza", en: "The mural at Trening centar Baza" },
  },
];

interface InstagramTeaserProps {
  locale: Locale;
  info: SiteInfo;
}

export function InstagramTeaser({ locale, info }: InstagramTeaserProps) {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionEyebrow>{INSTAGRAM_TEASER.eyebrow[locale]}</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight text-navy-900 sm:text-4xl">
              {INSTAGRAM_TEASER.headline[locale]}
            </h2>
            <p className="mt-3 text-charcoal-500">{INSTAGRAM_TEASER.body[locale]}</p>
          </div>
          <a
            href={info.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-wide text-navy-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:text-navy-900"
          >
            {INSTAGRAM_TEASER.cta[locale]}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PREVIEW_PHOTOS.map(({ src, alt }) => (
            <a
              key={src}
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${alt[locale]} — Instagram ${info.instagramHandle}`}
              className="group relative aspect-square overflow-hidden bg-navy-100"
            >
              <Image
                src={src}
                alt={alt[locale]}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition-colors group-hover:bg-navy-950/50">
                <InstagramIcon className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
