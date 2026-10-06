/**
 * Form layout for every content type — the editor renders these generically,
 * so adding a field is one line here plus one in server/content/schemas.ts.
 * Kept free of server imports: it ships to the browser.
 */

export type Option = { value: string; label: string };

export type FieldDef =
  | { kind: "text"; name: string; label: string; required?: boolean; maxLength?: number; placeholder?: string; hint?: string; inputMode?: "email" | "url" | "tel" }
  | { kind: "textarea"; name: string; label: string; rows?: number; maxLength?: number; hint?: string }
  | { kind: "localized"; name: string; label: string; required?: boolean; multiline?: boolean; rows?: number; maxLength?: number; hint?: string }
  | { kind: "number"; name: string; label: string; min?: number; max?: number; step?: number; nullable?: boolean; suffix?: string; hint?: string; required?: boolean }
  | { kind: "boolean"; name: string; label: string; hint?: string }
  | { kind: "select"; name: string; label: string; options: Option[] | "programs" | "trainers"; nullable?: boolean; required?: boolean; hint?: string }
  | { kind: "time"; name: string; label: string; required?: boolean }
  | { kind: "date"; name: string; label: string; hint?: string }
  | { kind: "media"; name: string; label: string; hint?: string }
  | { kind: "localizedList"; name: string; label: string; addLabel: string; max?: number; hint?: string }
  | { kind: "list"; name: string; label: string; itemLabel: string; addLabel: string; fields: FieldDef[]; newItem: () => Record<string, unknown>; max?: number; hint?: string };

export interface Section {
  title: string;
  description?: string;
  fields: FieldDef[];
}

const DAYS: Option[] = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota", "Nedjelja"].map((d) => ({ value: d, label: d }));
const STATUSES: Option[] = [
  { value: "Slobodno", label: "Slobodno" },
  { value: "Popunjeno", label: "Popunjeno" },
  { value: "Otkazano", label: "Otkazano" },
  { value: "Uskoro", label: "Uskoro" },
];
const COLORS: Option[] = ["Navy", "Zelena", "Jantar", "Crvena", "Siva", "Tirkizna"].map((c) => ({ value: c, label: c }));

const L = (bs = "", en = "") => ({ bs, en });
const order: FieldDef = { kind: "number", name: "order", label: "Redoslijed", min: 0, max: 9999, hint: "Manji broj = prikazuje se ranije." };

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const EDITOR_SECTIONS: Record<string, Section[]> = {
  termin: [
    {
      title: "Termin",
      fields: [
        { kind: "select", name: "programKey", label: "Program", options: "programs", required: true },
        { kind: "localized", name: "group", label: "Grupa (opciono)", maxLength: 40, hint: "Dodaje se iza naziva programa, npr. „18+“ ili „do 18“." },
        { kind: "select", name: "dayOfWeek", label: "Dan u sedmici", options: DAYS, required: true },
        { kind: "date", name: "specificDate", label: "Konkretan datum (opciono)", hint: "Samo ako termin važi za jedan dan, a ne za sedmičnu šemu." },
        { kind: "time", name: "startTime", label: "Početak", required: true },
        { kind: "time", name: "endTime", label: "Kraj", required: true },
      ],
    },
    {
      title: "Kapacitet i trener",
      description: "Slobodna mjesta se računaju automatski iz članova upisanih na termin.",
      fields: [
        { kind: "select", name: "trainerId", label: "Trener", options: "trainers", nullable: true, hint: "Obavezno za grupne treninge; nije potrebno za komercijalnu teretanu." },
        { kind: "number", name: "maxParticipants", label: "Maksimalan broj učesnika", min: 1, max: 100, required: true },
        { kind: "select", name: "status", label: "Status", options: STATUSES, hint: "„Slobodno“ se na sajtu automatski prikazuje kao „Popunjeno“ kad nema mjesta." },
      ],
    },
    {
      title: "Prikaz na sajtu",
      fields: [
        { kind: "textarea", name: "note", label: "Kratka napomena", rows: 2, maxLength: 300 },
        { kind: "select", name: "colorTag", label: "Boja / kategorija", options: COLORS },
        { kind: "number", name: "displayOrder", label: "Redoslijed (kad su dva termina u isto vrijeme)", min: 0, max: 9999 },
        { kind: "boolean", name: "featured", label: "Preporučeno" },
        { kind: "boolean", name: "active", label: "Aktivan (prikazan na sajtu)", hint: "Isključi da privremeno sakriješ termin bez brisanja." },
      ],
    },
  ],
  program: [
    {
      title: "Osnovno",
      fields: [
        { kind: "localized", name: "name", label: "Naziv", required: true, maxLength: 80 },
        { kind: "localized", name: "shortPitch", label: "Kratak opis (kartice, meta opis)", required: true, multiline: true, rows: 2, maxLength: 300 },
        { kind: "localized", name: "longDescription", label: "Opis na stranici programa", required: true, multiline: true, rows: 5, maxLength: 2000 },
        { kind: "boolean", name: "visible", label: "Prikaži program na sajtu", hint: "Kad je isključeno, stranica programa vraća 404 i program nestaje iz lista i sitemapa." },
        order,
      ],
    },
    {
      title: "Slika",
      fields: [
        { kind: "media", name: "imageId", label: "Glavna slika", hint: "Bez slike stranica prikazuje brendirani panel s nazivom i cijenom." },
        { kind: "localized", name: "imageAlt", label: "Opis slike (alt tekst)", maxLength: 200, hint: "Prazno = koristi se opis iz medijske biblioteke." },
      ],
    },
    {
      title: "Cjenovnik",
      fields: [
        {
          kind: "list",
          name: "tiers",
          label: "Stavke cjenovnika",
          itemLabel: "Stavka",
          addLabel: "Dodaj stavku",
          max: 12,
          newItem: () => ({ id: randomId("stavka"), label: L(), price: null, sessionsPerWeek: null }),
          fields: [
            { kind: "localized", name: "label", label: "Naziv", required: true, maxLength: 120 },
            { kind: "number", name: "price", label: "Cijena", min: 0, step: 0.5, nullable: true, suffix: "KM/mjesečno", hint: "Prazno = „Cijena na upit“." },
            { kind: "number", name: "sessionsPerWeek", label: "Treninga sedmično", min: 1, max: 14, nullable: true },
          ],
        },
      ],
    },
    {
      title: "Šta dobijaš",
      fields: [{ kind: "localizedList", name: "features", label: "Stavke", addLabel: "Dodaj stavku", max: 20 }],
    },
    {
      title: "Česta pitanja",
      description: "Prikazuju se na stranici programa i kao FAQ strukturirani podaci za Google.",
      fields: [
        {
          kind: "list",
          name: "faq",
          label: "Pitanja",
          itemLabel: "Pitanje",
          addLabel: "Dodaj pitanje",
          max: 20,
          newItem: () => ({ question: L(), answer: L() }),
          fields: [
            { kind: "localized", name: "question", label: "Pitanje", required: true, maxLength: 300 },
            { kind: "localized", name: "answer", label: "Odgovor", required: true, multiline: true, rows: 3, maxLength: 2000 },
          ],
        },
      ],
    },
  ],
  teamMember: [
    {
      title: "Član tima",
      fields: [
        { kind: "text", name: "name", label: "Ime i prezime", required: true, maxLength: 100 },
        { kind: "localized", name: "role", label: "Uloga", required: true, maxLength: 80, hint: "npr. Trener, Maser" },
        { kind: "media", name: "photoId", label: "Fotografija", hint: "Uspravna fotografija (2:3) izgleda najbolje." },
        { kind: "boolean", name: "leadsSessions", label: "Vodi termine", hint: "Pojavljuje se u izboru trenera na terminima." },
        order,
      ],
    },
  ],
  partner: [
    {
      title: "Partner",
      fields: [
        { kind: "text", name: "name", label: "Naziv", required: true, maxLength: 120 },
        { kind: "localized", name: "category", label: "Kategorija", required: true, maxLength: 80, hint: "npr. Sportski partner" },
        { kind: "localized", name: "description", label: "Opis", required: true, multiline: true, rows: 3, maxLength: 400 },
        { kind: "media", name: "logoId", label: "Logo" },
        { kind: "text", name: "url", label: "Web stranica", inputMode: "url", placeholder: "https://…" },
        order,
      ],
    },
  ],
  recoveryService: [
    {
      title: "Usluga",
      fields: [
        { kind: "localized", name: "name", label: "Naziv", required: true, maxLength: 80 },
        { kind: "localized", name: "duration", label: "Trajanje (opciono)", maxLength: 60, hint: "npr. 40 minuta" },
        order,
      ],
    },
    {
      title: "Cijene",
      fields: [
        {
          kind: "list",
          name: "prices",
          label: "Cijene",
          itemLabel: "Cijena",
          addLabel: "Dodaj cijenu",
          max: 12,
          newItem: () => ({ label: L(), amount: 0 }),
          fields: [
            { kind: "localized", name: "label", label: "Naziv", required: true, maxLength: 120 },
            { kind: "number", name: "amount", label: "Iznos", min: 0, step: 0.5, suffix: "KM", required: true },
          ],
        },
      ],
    },
    {
      title: "Benefiti",
      fields: [{ kind: "localizedList", name: "benefits", label: "Benefiti", addLabel: "Dodaj benefit", max: 20 }],
    },
  ],
  faqItem: [
    {
      title: "Pitanje",
      description: "Prikazuje se na početnoj stranici, u sekciji „Česta pitanja“.",
      fields: [
        { kind: "localized", name: "question", label: "Pitanje", required: true, maxLength: 300 },
        { kind: "localized", name: "answer", label: "Odgovor", required: true, multiline: true, rows: 4, maxLength: 2000 },
        order,
      ],
    },
  ],
  siteSettings: [
    {
      title: "Kontakt podaci",
      description: "Koriste se svuda na sajtu (zaglavlje, podnožje, kontakt, Google podaci) — drži ih identičnim Google Business profilu.",
      fields: [
        { kind: "text", name: "phone", label: "Telefon", required: true, inputMode: "tel", hint: "Međunarodni format, npr. +387 66 788 876 (koristi se i za WhatsApp)." },
        { kind: "text", name: "email", label: "Email (opciono)", inputMode: "email" },
        { kind: "text", name: "street", label: "Ulica i broj", required: true },
        { kind: "text", name: "city", label: "Grad", required: true },
        { kind: "text", name: "country", label: "Država", required: true },
        { kind: "text", name: "instagramUrl", label: "Instagram link", inputMode: "url" },
        { kind: "text", name: "instagramHandle", label: "Instagram korisničko ime", placeholder: "@tc.baza" },
      ],
    },
    {
      title: "Radno vrijeme",
      fields: [
        { kind: "time", name: "hoursOpens", label: "Otvara", required: true },
        { kind: "time", name: "hoursCloses", label: "Zatvara", required: true },
      ],
    },
    {
      title: "Termini na sajtu",
      fields: [
        { kind: "boolean", name: "terminiSectionEnabled", label: "Prikaži sekciju „Dostupni termini“ na sajtu" },
        { kind: "boolean", name: "showOnlyActiveTermini", label: "Prikaži samo aktivne termine", hint: "Kad je isključeno, prikazuju se i sakriveni termini." },
        { kind: "number", name: "commercialGymThreshold", label: "Prag za komercijalnu teretanu", min: 1, max: 50, hint: "Od koliko upisanih članova grupni trening zauzima teretanu." },
      ],
    },
  ],
};

/** Starting values for "Novi …" forms. */
export const NEW_DOCUMENT: Record<string, () => Record<string, unknown>> = {
  termin: () => ({
    programKey: "",
    group: L(),
    dayOfWeek: "Ponedjeljak",
    specificDate: null,
    startTime: "18:00",
    endTime: "19:00",
    trainerId: null,
    maxParticipants: 5,
    status: "Slobodno",
    note: "",
    colorTag: "Navy",
    displayOrder: 0,
    featured: false,
    active: true,
  }),
  teamMember: () => ({ name: "", role: L("Trener", "Trainer"), photoId: null, leadsSessions: true, order: 0 }),
  partner: () => ({ name: "", category: L(), description: L(), logoId: null, url: "", order: 0 }),
  recoveryService: () => ({ name: L(), duration: L(), prices: [{ label: L(), amount: 0 }], benefits: [], order: 0 }),
  faqItem: () => ({ question: L(), answer: L(), order: 0 }),
};
