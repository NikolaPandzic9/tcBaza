import type { Localized } from "./programs";

export interface TeamMember {
  name: string;
  role: Localized;
  photo: string | null;
}

// Bios, certificates, and specialties aren't provided by the client yet —
// deliberately not invented. Cards work with just name, role, and photo.
export const TEAM: TeamMember[] = [
  {
    name: "Andrej Ančić",
    role: { bs: "Trener", en: "Trainer" },
    photo: "/photos/team/andrej-ancic.jpg",
  },
  {
    name: "Sergej Mičić",
    role: { bs: "Trener", en: "Trainer" },
    photo: "/photos/team/sergej-micic.jpg",
  },
  {
    name: "Jovana Jovančić",
    role: { bs: "Trener", en: "Trainer" },
    photo: "/photos/team/jovana-jovancic.jpg",
  },
  {
    name: "Đorđe Faladžić",
    role: { bs: "Trener", en: "Trainer" },
    photo: "/photos/team/dorde-faladzic.jpg",
  },
  {
    name: "Luka Ančić",
    role: { bs: "Trener", en: "Trainer" },
    photo: "/photos/team/luka-ancic.jpg",
  },
  {
    name: "Dejan Đerić",
    role: { bs: "Maser", en: "Massage therapist" },
    photo: null,
  },
];

export const TEAM_INTRO = {
  eyebrow: { bs: "Naš tim", en: "Our team" } satisfies Localized,
  headline: {
    bs: "Ljudi iza svakog treninga",
    en: "The people behind every session",
  } satisfies Localized,
  body: {
    bs: "Stručan trener na svakom treningu nije samo obećanje — to je razlog zašto je grupa ograničena na 5 članova.",
    en: "A qualified trainer at every session isn't just a promise — it's the reason the group is capped at 5 members.",
  } satisfies Localized,
};
