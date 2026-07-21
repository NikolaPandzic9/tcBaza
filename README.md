# Trening centar Baza

Zvanični sajt Trening centra Baza (Istočno Sarajevo) — Next.js aplikacija sa dvojezičnim sadržajem (bosanski/engleski), Sanity CMS-om za raspored termina i Server Action kontakt formom.

## Tehnologije

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript (strict) + [Tailwind CSS v4](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) — lokalizovano rutiranje (bs bez prefiksa, `/en/...`)
- [Sanity](https://sanity.io) — CMS za sistem termina, ugniježđen na `/studio`
- [Resend](https://resend.com) — slanje kontakt forme
- [Motion](https://motion.dev) — animacije

## Pokretanje lokalno

Preduslovi: Node.js 20+, npm.

```bash
npm install
cp .env.example .env.local   # popuni stvarne vrijednosti
npm run dev                  # http://localhost:3000
```

Sajt radi i bez popunjenih env varijabli — funkcije koje zavise od njih (raspored termina, kontakt forma, analitika) su tada isključene, bez pada aplikacije.

## Skripte

| Skripta | Opis |
|---|---|
| `npm run dev` | Pokreće razvojni server |
| `npm run build` | Produkcioni build |
| `npm run start` | Pokreće produkcioni build lokalno |
| `npm run typecheck` | Provjera TypeScript tipova |
| `npm run lint` | ESLint provjera |

Prije svakog push-a: `npm run typecheck && npm run lint && npm run build`.

## Struktura projekta

```
src/
  app/            App Router rute — [locale]/ za javne stranice, studio/ za Sanity Studio
  components/     UI komponente, grupisane po domeni (layout, home, schedule, ...)
  content/        Statički sadržaj stranica (cijene, timovi, opisi usluga...)
  i18n/           next-intl rutiranje i navigacija
  lib/            Pomoćne funkcije, konstante, validacija
  sanity/         Sanity klijent, šeme i upiti
messages/         Prevodi za UI tekstove (bs.json, en.json)
public/           Statički fajlovi i optimizovane slike
```

## Deploy

Aplikacija je pripremljena za [Vercel](https://vercel.com) — svaki push na glavnu granu pokreće novi deploy. Potrebne environment varijable su navedene u `.env.example`.

## CMS

Raspored termina se uređuje na `/studio` (Sanity Studio), bez potrebe za izmjenom koda.
