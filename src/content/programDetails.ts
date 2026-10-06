import { DEFAULT_CONTACT } from "@/lib/constants";
import type { Localized, ProgramSlug } from "./programs";

export interface FaqItem {
  question: Localized;
  answer: Localized;
}

export interface ProgramDetail {
  longDescription: Localized;
  features: Localized[];
  /** null where no real client photo exists — subpage falls back to a
   * typography/motif treatment instead of a photo. */
  image: { src: string; alt: Localized } | null;
  /** Rendered as a visible FAQ section plus matching FAQPage JSON-LD.
   * Every answer restates facts already published elsewhere on the site. */
  faq?: FaqItem[];
}

export const DEFAULT_PROGRAM_DETAILS: Record<ProgramSlug, ProgramDetail> = {
  rekreativci: {
    longDescription: {
      bs: "Program za sve koji žele trenirati ozbiljno, ali bez pritiska takmičarskog sporta. Svaki član prolazi inicijalno testiranje, dobija individualni plan i trenira u grupi od maksimalno 5 ljudi — dovoljno malo da trener prati svakoga, dovoljno veliko da trening bude dinamičan.",
      en: "A program for anyone who wants to train seriously, without the pressure of competitive sport. Every member goes through an initial assessment, gets an individual plan, and trains in a group of up to 5 people — small enough for the trainer to watch everyone, big enough to keep training dynamic.",
    },
    features: [
      { bs: "Personalizovani grupni treninzi", en: "Personalized group training" },
      { bs: "Maksimalno 5 članova u grupi", en: "Maximum 5 members per group" },
      {
        bs: "Individualni plan nakon inicijalnog testiranja",
        en: "Individual plan after an initial assessment",
      },
      {
        bs: "Stručni trener na svakom treningu",
        en: "A qualified trainer at every session",
      },
      { bs: "Kontinuirano praćenje napretka", en: "Continuous progress tracking" },
    ],
    image: {
      src: "/photos/strength-training-1.jpg",
      alt: {
        bs: "Grupni trening snage u Bazi",
        en: "Group strength training at Baza",
      },
    },
    faq: [
      {
        question: { bs: "Koliko košta grupni trening za rekreativce?", en: "How much is recreational group training?" },
        answer: {
          bs: "150 KM mjesečno do 18 godina i 200 KM mjesečno za 18+, uz 3 treninga sedmično.",
          en: "150 KM per month under 18 and 200 KM per month for 18+, with 3 sessions per week.",
        },
      },
      {
        question: { bs: "Koliko ljudi trenira u grupi?", en: "How many people train in a group?" },
        answer: {
          bs: "Najviše 5 članova, uz stručnog trenera na svakom treningu.",
          en: "Up to 5 members, with a qualified trainer at every session.",
        },
      },
      {
        question: { bs: "Mogu li početi bez iskustva?", en: "Can I start without any experience?" },
        answer: {
          bs: "Da. Individualni plan se pravi tek nakon inicijalnog testiranja, bez obzira na to odakle kreneš.",
          en: "Yes. Your individual plan is built only after an initial assessment, wherever you're starting from.",
        },
      },
    ],
  },
  sportisti: {
    longDescription: {
      bs: "Priprema za takmičarski sport gradi se na istom principu — testiranje prije plana. Za sportiste to znači plan koji cilja na eksplozivnost, snagu i sprečavanje povreda specifično za njihov sport, uz kontinuirano praćenje napretka kroz sezonu.",
      en: "Preparation for competitive sport is built on the same principle — testing before the plan. For athletes, that means a plan targeting power, strength, and injury prevention specific to their sport, with progress tracked continuously through the season.",
    },
    features: [
      {
        bs: "Individualni plan nakon inicijalnog testiranja",
        en: "Individual plan after an initial assessment",
      },
      {
        bs: "Fokus na eksplozivnost, snagu i prevenciju povreda",
        en: "Focus on power, strength, and injury prevention",
      },
      { bs: "Stručni trener na svakom treningu", en: "A qualified trainer at every session" },
      {
        bs: "Praćenje sportskog napretka kroz sezonu",
        en: "Athletic progress tracked through the season",
      },
    ],
    image: {
      src: "/photos/testing-jump-assessment.jpg",
      alt: {
        bs: "Testiranje eksplozivnosti sportiste u Bazi",
        en: "Athlete power assessment at Baza",
      },
    },
    faq: [
      {
        question: { bs: "Koliko košta priprema za sportiste?", en: "How much is athlete preparation?" },
        answer: {
          bs: "150 KM mjesečno za uzrast 14–19 godina i 200 KM mjesečno za 19+.",
          en: "150 KM per month for ages 14–19 and 200 KM per month for 19+.",
        },
      },
      {
        question: { bs: "Kako izgleda početak?", en: "How does it start?" },
        answer: {
          bs: "Inicijalnim testiranjem. Na osnovu rezultata pravi se individualni plan usmjeren na eksplozivnost, snagu i prevenciju povreda za tvoj sport.",
          en: "With an initial assessment. The results shape an individual plan focused on power, strength, and injury prevention for your sport.",
        },
      },
      {
        question: { bs: "Šta ako je sportista mlađi od 14 godina?", en: "What if the athlete is under 14?" },
        answer: {
          bs: "Za sportiste mlađe od 14 godina program se dogovara individualno — javi nam se direktno. Za djecu postoji i program Sportski pasoš.",
          en: "For athletes under 14, the program is arranged individually — get in touch directly. There's also the Sports Passport program for kids.",
        },
      },
    ],
  },
  "komercijalna-teretana": {
    longDescription: {
      bs: "Za one kojima ne treba grupni raspored, ali žele pristup opremljenoj teretani — članarina pokriva samostalan trening u terminima koji nisu zauzeti grupnim treninzima.",
      en: "For those who don't need a group schedule but want access to a fully equipped gym — the membership covers independent training in the time slots not booked by group sessions.",
    },
    features: [
      { bs: "Samostalan pristup opremi", en: "Independent access to equipment" },
      {
        bs: "Termini van rasporeda grupnih treninga",
        en: "Slots outside the group-training schedule",
      },
      { bs: "Bez obaveznog rasporeda", en: "No fixed schedule to follow" },
    ],
    image: {
      src: "/photos/strength-training-2.jpg",
      alt: {
        bs: "Teretana u Bazi, oprema za samostalan trening",
        en: "The gym floor at Baza, equipment for independent training",
      },
    },
    faq: [
      {
        question: { bs: "Koliko košta članarina za teretanu?", en: "How much is the gym membership?" },
        answer: {
          bs: "Mjesečna članarina za komercijalnu teretanu je 50 KM.",
          en: "The monthly open gym membership is 50 KM.",
        },
      },
      {
        question: { bs: "Kada mogu trenirati u teretani?", en: "When can I use the gym?" },
        answer: {
          bs: `Tokom radnog vremena, svaki dan od ${DEFAULT_CONTACT.hours.opens} do ${DEFAULT_CONTACT.hours.closes}, osim u terminima kad je grupni trening popunjen sa 3 ili više članova.`,
          en: `During business hours, every day from ${DEFAULT_CONTACT.hours.opens} to ${DEFAULT_CONTACT.hours.closes}, except when a group session has 3 or more members booked.`,
        },
      },
    ],
  },
  "sportski-pasos": {
    longDescription: {
      bs: "Sportski pasoš je program za djecu u kojem kroz igru, stručan rad i raznovrsne sportske aktivnosti razvijaju bazne motoričke sposobnosti, snagu, brzinu i koordinaciju. Svaki mjesec donosi pažljivo planiran raspored treninga i upoznavanje s novim sportskim disciplinama. Broj mjesta je ograničen, kako bi svako dijete dobilo maksimalnu posvećenost trenera.",
      en: "Sports Passport is a program for kids where, through play, expert coaching, and a variety of sports, they build fundamental motor skills, strength, speed, and coordination. Every month brings a carefully planned training schedule and an introduction to new sports. Places are limited, so every child gets the coach's full attention.",
    },
    features: [
      {
        bs: "Program za djecu — kroz igru i stručan rad",
        en: "A program for kids — through play and expert coaching",
      },
      {
        bs: "Razvoj baznih motoričkih sposobnosti, snage, brzine i koordinacije",
        en: "Builds fundamental motor skills, strength, speed, and coordination",
      },
      {
        bs: "Svaki mjesec pažljivo planiran raspored treninga",
        en: "A carefully planned training schedule every month",
      },
      {
        bs: "Svaki mjesec upoznavanje s novim sportskim disciplinama",
        en: "A new sport to discover every month",
      },
      {
        bs: "Ograničen broj mjesta — maksimalna posvećenost svakom djetetu",
        en: "Limited places — full attention for every child",
      },
      {
        bs: "BAZA Training Centar, Jovana Dučića 84",
        en: "BAZA Training Centar, Jovana Dučića 84",
      },
    ],
    // No real client photo of the kids' program exists yet — falls back to
    // the motif treatment in ProgramDetailTemplate until one is supplied.
    image: null,
    faq: [
      {
        question: { bs: "Za koga je Sportski pasoš?", en: "Who is Sports Passport for?" },
        answer: {
          bs: "Sportski pasoš je sportski program namijenjen djeci. Kroz igru i raznovrsne sportske aktivnosti djeca razvijaju bazne motoričke sposobnosti, snagu, brzinu i koordinaciju.",
          en: "Sports Passport is a sports program for kids. Through play and a variety of sports, children build fundamental motor skills, strength, speed, and coordination.",
        },
      },
      {
        question: { bs: "Koliko košta Sportski pasoš?", en: "How much does Sports Passport cost?" },
        answer: {
          bs: "Cijena programa je 80 KM mjesečno.",
          en: "The program costs 80 KM per month.",
        },
      },
      {
        question: { bs: "Šta djeca rade na treninzima?", en: "What do kids do in the sessions?" },
        answer: {
          bs: "Svaki mjesec ima pažljivo planiran raspored treninga, a djeca se upoznaju s novim sportskim disciplinama. Rad vodi stručan trener, uz igru i raznovrsne sportske aktivnosti.",
          en: "Every month has a carefully planned training schedule, and the kids are introduced to new sports. Sessions are led by a qualified coach, built around play and a variety of sports.",
        },
      },
      {
        question: { bs: "Gdje se održavaju treninzi?", en: "Where are the sessions held?" },
        answer: {
          bs: `U BAZA Training Centru, ${DEFAULT_CONTACT.street}, ${DEFAULT_CONTACT.city}.`,
          en: `At BAZA Training Centar, ${DEFAULT_CONTACT.street}, ${DEFAULT_CONTACT.city}.`,
        },
      },
      {
        question: { bs: "Koliko djece je u grupi?", en: "How many kids are in a group?" },
        answer: {
          bs: "Broj mjesta je ograničen, kako bi trener mogao biti maksimalno posvećen svakom djetetu.",
          en: "Places are limited, so the coach can give every child their full attention.",
        },
      },
    ],
  },
  "online-program": {
    longDescription: {
      bs: "Za one koji ne mogu redovno dolaziti u prostor Baze, ali i dalje žele plan izrađen za njih — ne generički šablon. Za detalje o sadržaju i cijeni kontaktiraj nas direktno.",
      en: "For anyone who can't make it to the Baza space regularly, but still wants a plan built for them — not a generic template. Contact us directly for details on content and pricing.",
    },
    features: [
      {
        bs: "Trening plan prilagođen tvojim ciljevima",
        en: "A training plan tailored to your goals",
      },
      {
        bs: "Praćenje napretka na daljinu",
        en: "Remote progress tracking",
      },
    ],
    // No dedicated photo for the online program yet — falls back to the
    // motif treatment in ProgramDetailTemplate, same as any program
    // without a real client photo.
    image: null,
  },
};
