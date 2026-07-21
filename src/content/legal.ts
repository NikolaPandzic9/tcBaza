export interface LegalSection {
  heading: { bs: string; en: string };
  body: { bs: string; en: string }[];
}

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: { bs: "Ko smo mi", en: "Who we are" },
    body: [
      {
        bs: "Trening centar Baza, Jovana Dučića 84, Istočno Sarajevo, Bosna i Hercegovina, telefon +387 66 788 876. Ova politika privatnosti objašnjava koje podatke prikupljamo preko sajta tcbaza.ba, zašto ih prikupljamo i kako se koriste.",
        en: "Trening centar Baza, Jovana Dučića 84, Istočno Sarajevo, Bosnia and Herzegovina, phone +387 66 788 876. This privacy policy explains what data we collect through tcbaza.ba, why we collect it, and how it's used.",
      },
    ],
  },
  {
    heading: { bs: "Koje podatke prikupljamo", en: "What data we collect" },
    body: [
      {
        bs: "Kontakt forma: kada nam pošalješ poruku preko stranice Kontakt, prikupljamo ime, email adresu, telefon (ako ga uneseš) i sadržaj poruke. Ovi podaci se koriste isključivo da ti odgovorimo na upit i ne dijele se sa trećim stranama osim servisa koji tehnički omogućava slanje emaila (vidi ispod).",
        en: "Contact form: when you send us a message through the Contact page, we collect your name, email address, phone number (if provided), and the message content. This data is used solely to respond to your inquiry and isn't shared with third parties beyond the service that technically delivers the email (see below).",
      },
      {
        bs: "Analitika posjeta: ako prihvatiš kolačiće za analitiku, koristimo Google Analytics 4 da razumijemo koje stranice se posjećuju i kako posjetioci koriste sajt (broj posjeta, uređaj, približna lokacija na nivou grada). Ovi podaci su agregirani i ne koriste se za identifikaciju pojedinca.",
        en: "Visit analytics: if you accept analytics cookies, we use Google Analytics 4 to understand which pages are visited and how visitors use the site (visit counts, device type, approximate city-level location). This data is aggregated and isn't used to identify individuals.",
      },
      {
        bs: "Ne prikupljamo lozinke niti kreiramo korisničke naloge — sajt trenutno nema sistem za prijavu.",
        en: "We don't collect passwords or create user accounts — the site currently has no login system.",
      },
    ],
  },
  {
    heading: { bs: "Kolačići (cookies)", en: "Cookies" },
    body: [
      {
        bs: "Sajt koristi kolačiće samo ako prihvatiš analitiku putem banera za pristanak — bez tog pristanka, Google Analytics se ne učitava i ne postavlja kolačiće. Osnovno funkcionisanje sajta (navigacija, jezik) ne zahtijeva kolačiće koji bi trebali tvoj pristanak.",
        en: "The site only uses cookies if you accept analytics via the consent banner — without that consent, Google Analytics doesn't load and sets no cookies. Core site functionality (navigation, language) doesn't require cookies that need your consent.",
      },
      {
        bs: "Meta Pixel (Facebook/Instagram): priprema za marketinšku upotrebu postoji u kodu sajta, ali je trenutno isključena i ne prikuplja podatke dok se ne aktivira.",
        en: "Meta Pixel (Facebook/Instagram): the code is in place for future marketing use, but it is currently disabled and collects no data until switched on.",
      },
    ],
  },
  {
    heading: { bs: "Treće strane", en: "Third parties" },
    body: [
      {
        bs: "Resend — servis koji tehnički šalje email kada popuniš kontakt formu. Vidi sadržaj tvoje poruke i email adresu isključivo u svrhu isporuke.",
        en: "Resend — the service that technically delivers the email when you submit the contact form. It sees your message content and email address solely for delivery purposes.",
      },
      {
        bs: "Google Analytics 4 i Google Maps (za prikaz lokacije) — Google može obrađivati podatke o tvojoj posjeti u skladu sa svojom politikom privatnosti.",
        en: "Google Analytics 4 and Google Maps (for the location embed) — Google may process data about your visit under its own privacy policy.",
      },
      {
        bs: "Sanity — sistem za upravljanje sadržajem koji koristimo za raspored termina. Ne prikuplja podatke o posjetiocima sajta, samo sadrži tekstualni sadržaj koji mi unosimo.",
        en: "Sanity — the content management system we use for the training schedule. It doesn't collect visitor data; it only holds text content that we enter.",
      },
    ],
  },
  {
    heading: { bs: "Čuvanje podataka", en: "Data retention" },
    body: [
      {
        bs: "Poruke poslane putem kontakt forme čuvamo onoliko dugo koliko je potrebno da odgovorimo na upit i eventualno pratimo dogovor oko članstva ili termina, a zatim ih brišemo ili arhiviramo u skladu sa dobrom poslovnom praksom.",
        en: "Messages sent via the contact form are kept as long as needed to respond to the inquiry and follow up on any membership or scheduling arrangement, then deleted or archived per good business practice.",
      },
    ],
  },
  {
    heading: { bs: "Tvoja prava", en: "Your rights" },
    body: [
      {
        bs: "Imaš pravo zatražiti uvid, ispravku ili brisanje podataka koje smo prikupili o tebi. Za bilo kakav zahtjev ili pitanje, pozovi nas na +387 66 788 876.",
        en: "You have the right to request access to, correction of, or deletion of data we've collected about you. For any request or question, call us at +387 66 788 876.",
      },
    ],
  },
];

export const TERMS_OF_USE: LegalSection[] = [
  {
    heading: { bs: "Uslovi korištenja", en: "Terms of use" },
    body: [
      {
        bs: "Korištenjem sajta tcbaza.ba prihvataš ove uslove. Sadržaj sajta (tekstovi, fotografije, logo) vlasništvo je Trening centra Baza i ne smije se koristiti bez dozvole.",
        en: "By using tcbaza.ba, you accept these terms. The site's content (text, photos, logo) belongs to Trening centar Baza and may not be used without permission.",
      },
      {
        bs: "Cijene i raspored termina prikazani na sajtu mogu se promijeniti — za tačne i aktuelne informacije uvijek je najsigurnije pozvati direktno.",
        en: "Prices and the training schedule shown on the site may change — for the most accurate, current information, calling us directly is always safest.",
      },
      {
        bs: "Sajt ne snosi odgovornost za privremenu nedostupnost usluge zbog tehničkog održavanja ili više sile.",
        en: "The site isn't liable for temporary unavailability due to technical maintenance or force majeure.",
      },
    ],
  },
  {
    heading: { bs: "Impresum", en: "Impressum" },
    body: [
      {
        bs: "Trening centar Baza. Adresa: Jovana Dučića 84, Istočno Sarajevo, Bosna i Hercegovina. Telefon: +387 66 788 876.",
        en: "Trening centar Baza. Address: Jovana Dučića 84, Istočno Sarajevo, Bosnia and Herzegovina. Phone: +387 66 788 876.",
      },
      {
        bs: "TODO: matični broj/JIB i pravni oblik registracije nisu dostavljeni — dopuniti prije lansiranja sajta u skladu sa važećim zakonodavstvom BiH.",
        en: "TODO: business registration number and legal entity type haven't been supplied — add before launch, per applicable BiH law.",
      },
    ],
  },
];
