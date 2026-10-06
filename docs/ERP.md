# TC Baza ERP — tehnička dokumentacija i deploy

ERP (erp.tcbaza.ba) je interni sistem koji je zamijenio Sanity. Upravlja svim sadržajem javnog sajta i operativnim podacima kluba. Radi u **istom Next.js projektu i istom Vercel deployu** kao sajt — izmjena u ERP-u je vidljiva na sajtu odmah, bez webhookova.

---

## 1. Šta ERP pokriva

| Modul | Opis | Gdje na sajtu |
|---|---|---|
| **Termini** | Sedmični raspored; program, grupa, dan, vrijeme, **trener iz tima**, kapacitet, status, napomena, boja, redoslijed, aktivan. Validacije iz stare Sanity šeme (kraj poslije početka, trener obavezan osim za teretanu, upozorenje za duplikat i grupu > 5). | `/rezervacija-termina`, početna, dostupnost teretane |
| **Zauzetost** | Upis članova na termin. **Slobodna mjesta se računaju automatski** (max − upisani aktivni članovi); „Slobodno“ bez mjesta se prikazuje kao „Popunjeno“. Zaključavanje reda sprječava da dvoje dobije zadnje mjesto. | isto |
| **Programi i cijene** | Tekstovi, cjenovnik, slika, „Šta dobijaš“, FAQ, vidljivost, redoslijed (programi se ne brišu — imaju fiksne stranice; sakriveni program vraća 404 i nestaje iz sitemapa). | `/usluge/*`, cjenovnik, kviz, početna |
| **Tim** | Članovi tima s fotografijom; oznaka „Vodi termine“ puni izbor trenera. | `/nas-tim` |
| **Oporavak, Partneri, Česta pitanja** | Puni CRUD. | `/usluge/oporavak`, `/partneri`, početna |
| **Podešavanja** | Telefon, adresa, email, Instagram, radno vrijeme, prikaz termina, prag za komercijalnu teretanu. | zaglavlje, podnožje, kontakt, Google podaci (JSON-LD) |
| **Mediji** | Upload (drag & drop), automatska optimizacija (WebP, max 2400 px, uklanjanje EXIF/GPS), alt tekstovi, prikaz gdje se fajl koristi, zaštita od brisanja fajla u upotrebi. | sve slike sadržaja |
| **Članovi** | Evidencija, roditelj/staratelj (za djecu), članarine s periodom i statusom (aktivna / ističe / istekla), uplate, upisani termini, CSV izvoz. | — |
| **Uplate** | Pregled po periodu i načinu plaćanja, suma, CSV izvoz. | — |
| **Upiti** | Svaka poruka s kontakt forme ide u inbox (status, interna bilješka) — i kad email nije podešen. | `/kontakt` |
| **Korisnici, Zapisnik aktivnosti, Profil** | Uloge, lozinke, sesije, audit log. | — |

Svi sadržajni tipovi imaju **nacrt / objavljeno**, **historiju verzija** (ko, kada, koja polja) s **vraćanjem verzije**, **otpad** (vraćanje ili trajno brisanje) i pretragu, filtere, sortiranje i paginaciju.

### Uloge

| Uloga | Dozvole |
|---|---|
| Administrator | Sve, uključujući korisnike, podešavanja, trajno brisanje i zapisnik aktivnosti |
| Urednik | Sadržaj sajta, termini, mediji, članovi, uplate, upiti |
| Trener | Pregled termina i članova, upis/ispis članova na termine |

Dozvole su definisane na jednom mjestu: `src/server/auth/permissions.ts`.

---

## 2. Arhitektura

```
erp.tcbaza.ba ──┐                       ┌── src/app/erp/**      (ERP, zaštićen)
                ├─ src/proxy.ts (host) ─┤
www.tcbaza.ba ──┘                       └── src/app/[locale]/** (javni sajt)
                                               │
                         src/server/site/content.ts (keš po tagovima)
                                               │
                        PostgreSQL (Neon)  ←── src/server/** (servisni sloj)
                        Vercel Blob (mediji)
```

- **Baza:** PostgreSQL + Drizzle ORM. Šema: `src/server/db/schema.ts`, migracije: `drizzle/`.
- **Sadržaj:** tabela `content_documents` (nacrt + objavljena verzija u JSONB) i `content_versions` (historija). Validacija: `src/server/content/schemas.ts` (zod) — ista za ERP forme, seed i sajt.
- **Javni sajt** čita samo objavljene verzije preko `unstable_cache` s tagovima `content:<tip>`; ERP akcije te tagove odmah poništavaju.
- **Bez baze** (npr. lokalni build bez `DATABASE_URL`) sajt prikazuje ugrađeni sadržaj iz `src/content/*` — isti koji je uvezen u bazu pri prvom pokretanju.

---

## 3. Sigurnost

- **Lozinke:** argon2id (19 MiB, 2 iteracije), politika jačine (≥ 10 znakova, 3 klase znakova, bez korisničkog imena). Početni admin se kreira iz env varijabli — lozinka nikad nije u kodu.
- **Brute-force:** 5 neuspjelih pokušaja po nalogu ili 30 po IP adresi u 15 min → privremena blokada. Brojači su u bazi (rade na svim serverless instancama). Odgovor i trajanje provjere su isti za nepostojeći nalog.
- **Sesije:** nasumični token u `__Host-` kolačiću (HttpOnly, Secure, SameSite=Strict); u bazi je samo SHA-256 tokena. Istek nakon 2 h neaktivnosti, najkasnije 12 h. Promjena lozinke, deaktivacija naloga ili reset odjavljuju sve sesije. Nova sesija nakon promjene lozinke. Pregled i odjava uređaja na profilu.
- **CSRF:** sve izmjene idu kroz Next.js Server Actions (provjera Origin/Host) + SameSite=Strict kolačić.
- **XSS:** React escaping; korisnički tekst se nikad ne renderuje kao HTML; SVG upload je zabranjen; JSON-LD je escapovan; CSP header.
- **Upload:** provjera po stvarnom sadržaju (magic bytes / dekodiranje), ne po ekstenziji; slike se ponovo enkodiraju.
- **CSV izvoz:** zaštita od „formula injection“.
- **Ostalo:** HSTS, `Cache-Control: no-store` i `noindex` na ERP domenu, `/erp` putanja nedostupna s javnog domena, audit log svake prijave i izmjene (s IP adresom).

---

## 4. Lokalni razvoj

```bash
npm install
cp .env.example .env.local      # popuni ERP_ADMIN_PASSWORD
npm run db:dev                  # PostgreSQL na portu 5433 (ostavi da radi)
npm run db:migrate              # tabele + uvoz sadržaja + početni admin
npm run dev
```

- Sajt: http://localhost:3000 · ERP: http://erp.localhost:3000
- Testovi (koriste zasebnu bazu `tcbaza_test`): `npm test`
- Promjena šeme baze: izmijeni `src/server/db/schema.ts` → `npm run db:generate` → commit novog fajla iz `drizzle/`. Migracije se primjenjuju automatski pri buildu.

---

## 5. Deploy na Vercel (Neon + Blob)

1. **Baza:** Vercel → projekat → *Storage* → *Create Database* → **Neon (Postgres)**. Region: **Frankfurt (eu-central-1)** — najbliže BiH. Vercel automatski dodaje `DATABASE_URL`.
2. **Mediji:** *Storage* → *Create* → **Blob** → poveži s projektom. Vercel dodaje `BLOB_READ_WRITE_TOKEN`.
3. **Env varijable** (*Settings → Environment Variables*, Production):
   - `ERP_ADMIN_USERNAME` = `Luka`
   - `ERP_ADMIN_PASSWORD` = tvoja lozinka (samo za prvi deploy; nakon prve prijave je možeš obrisati)
   - `ERP_HOST` = `erp.tcbaza.ba`
   - `NEXT_PUBLIC_SITE_URL` = `https://www.tcbaza.ba`
   - ostale (Resend, GA4) kao i ranije
4. **Deploy:** `npm run build` automatski primjenjuje migracije, uvozi početni sadržaj (samo prvi put) i kreira admina (samo ako nema korisnika), pa gradi sajt.
5. **Ukloni stare Sanity varijable** (`NEXT_PUBLIC_SANITY_*`, `SANITY_REVALIDATE_SECRET`) i Sanity webhook — više se ne koriste.

### Domena erp.tcbaza.ba

1. Vercel → projekat → *Settings → Domains* → **Add** → `erp.tcbaza.ba`.
2. Kod registrara/DNS provajdera domene `tcbaza.ba` dodaj zapis koji Vercel prikaže, tipično:

   | Tip | Ime (host) | Vrijednost | TTL |
   |---|---|---|---|
   | CNAME | `erp` | `cname.vercel-dns.com` *(ili tačna vrijednost koju Vercel prikaže)* | 3600 |

   Ako je DNS domene već delegiran na Vercel (nameserveri `ns1/ns2.vercel-dns.com`), zapis se dodaje automatski — ništa ne radiš ručno.
3. **SSL:** Vercel automatski izdaje i obnavlja Let's Encrypt certifikat čim DNS proradi (obično par minuta, do 48 h zbog propagacije). Ako domena ima **CAA** zapis, mora dozvoljavati `letsencrypt.org`.
4. HTTPS je obavezan: HTTP se automatski preusmjerava, a HSTS header je već postavljen.
5. Provjera: `https://erp.tcbaza.ba/login` prikazuje prijavu; `https://www.tcbaza.ba/erp` vraća 404.

### Nakon prvog deploya

- Prijavi se kao **Luka** i provjeri da sve radi.
- Kreiraj i drugog administratora — ako jedan zaboravi lozinku, drugi mu je postavlja (Korisnici → Nova lozinka).
- Po želji obriši `ERP_ADMIN_PASSWORD` iz Vercel env varijabli (ne koristi se dok postoji bar jedan korisnik).
- Kreiraj naloge za ostale (Korisnici → Novi korisnik) s odgovarajućom ulogom.

---

## 6. Backup i održavanje

- **Neon** čuva historiju za point-in-time restore (dužina perioda zavisi od plana — provjeri u Neon konzoli). Za dodatnu sigurnost: periodični `pg_dump` (`pg_dump "$DATABASE_URL" > backup.sql`).
- **Vercel Blob** fajlovi se ne brišu automatski; brisanje iz ERP medija briše i fajl.
- Zapisnik aktivnosti se ne briše iz ERP-a; tabela `login_attempts` se sama čisti (stariji od 30 dana).
- Kvartalno: `npm outdated`, ažuriranje paketa, `npm test && npm run build`.
