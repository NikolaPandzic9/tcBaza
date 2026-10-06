# Trening centar Baza

Zvanični sajt Trening centra Baza (Istočno Sarajevo) i interni ERP (erp.tcbaza.ba) — jedna Next.js aplikacija: dvojezični javni sajt (bosanski/engleski) i zaštićeni sistem za upravljanje sadržajem, terminima, članovima, uplatama i upitima.

## Tehnologije

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript (strict) + [Tailwind CSS v4](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) — lokalizovano rutiranje (bs bez prefiksa, `/en/...`)
- PostgreSQL ([Neon](https://neon.tech)) + [Drizzle ORM](https://orm.drizzle.team) — sadržaj sajta i ERP podaci
- [Vercel Blob](https://vercel.com/storage/blob) — mediji (slike optimizovane sa sharp)
- argon2id lozinke, sesije u bazi, zaštita od brute-force napada, audit log
- [Resend](https://resend.com) — email obavještenja s kontakt forme (opciono)
- [Motion](https://motion.dev) — animacije · [Vitest](https://vitest.dev) — testovi

## Pokretanje lokalno

Preduslovi: Node.js 20+, npm.

```bash
npm install
cp .env.example .env.local   # popuni ERP_ADMIN_PASSWORD
npm run db:dev               # lokalni PostgreSQL (port 5433), ostavi da radi
npm run db:migrate           # tabele, uvoz početnog sadržaja, početni admin
npm run dev
```

- Sajt: http://localhost:3000
- ERP: http://erp.localhost:3000

Sajt radi i bez baze (`DATABASE_URL` prazan) — tada prikazuje ugrađeni sadržaj iz `src/content/`.

## Skripte

| Skripta | Opis |
|---|---|
| `npm run dev` | Razvojni server |
| `npm run build` | Migracije baze + produkcioni build |
| `npm run start` | Pokreće produkcioni build lokalno |
| `npm run typecheck` | Provjera TypeScript tipova |
| `npm run lint` | ESLint provjera |
| `npm test` | Testovi (zasebna testna baza) |
| `npm run db:dev` | Lokalni PostgreSQL server |
| `npm run db:migrate` | Primjena migracija + seed |
| `npm run db:generate` | Nova migracija nakon izmjene šeme |

Prije svakog push-a: `npm run typecheck && npm run lint && npm test && npm run build`.

## Struktura projekta

```
src/
  app/
    [locale]/     javni sajt
    erp/          ERP (dostupan samo na erp.* poddomeni)
    media/        lokalno serviranje uploada (razvoj)
  components/     UI komponente (sajt + erp/)
  content/        ugrađeni (početni) sadržaj i statični tekstovi stranica
  server/         baza, autentifikacija, sadržaj, mediji, članovi, upiti
  proxy.ts        rutiranje po hostu (sajt / ERP) + jezici
drizzle/          SQL migracije
scripts/          lokalna baza, migracije
tests/            Vitest testovi
docs/ERP.md       ERP: moduli, sigurnost, deploy, DNS, SSL
```

## Deploy

Vercel (sajt + ERP u jednom projektu), Neon PostgreSQL i Vercel Blob. Detaljno uputstvo, DNS za `erp.tcbaza.ba` i SSL: [docs/ERP.md](docs/ERP.md).
