# CreatorOS — Project State

## 1. Obiettivo del progetto

CreatorOS è, in questa fase, un MVP per acquisire i primi creator interessati alla futura
piattaforma di analytics/growth per creator digitali. Il flusso implementato:

Visitatore → Homepage → `/early-access` (form multi-sezione) → salvataggio nel database →
email di conferma → pagina di successo → il founder gestisce il creator dal pannello `/admin`.

## 2. Stack tecnologico

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Prisma ORM, datasource SQLite (`file:./dev.db`) — migrabile a PostgreSQL cambiando solo
  `provider` e `DATABASE_URL` in `prisma/schema.prisma`
- Autenticazione admin: sessione JWT firmata (`jose`) in cookie httpOnly, credenziali da `.env`
- Email: `nodemailer` con modalità `console` (dev, nessuna configurazione) o `smtp`
- Validazione: `zod`, condivisa tra client e server (`src/lib/validation.ts`)

## 3. Struttura delle cartelle

```
src/
  app/
    page.tsx                     Homepage
    early-access/                Form di registrazione + success page
    about/ contact/ privacy/ terms/
    admin/
      login/                     Login pubblico (fuori dal layout protetto)
      (dashboard)/               Route group protetto da layout.tsx (sessione admin)
        page.tsx                 Dashboard KPI
        creators/                Tabella + dettaglio creator
    api/
      early-access/route.ts      POST — registrazione creator
      admin/login|logout         Sessione admin
      admin/creators             Lista (filtri/ricerca/paginazione) + dettaglio (GET/PATCH)
      admin/stats                KPI aggregati (riutilizzabile da altri client)
  components/                    UI condivisa (header, footer, form, admin layout)
  lib/                           prisma client, auth, email, validation, rate-limit, constants
  proxy.ts                      Protezione route /admin/* (verifica cookie di sessione; il file
                                 si chiama `proxy.ts`, non più `middleware.ts`, come richiesto da
                                 Next.js 16)
prisma/schema.prisma              Modello Creator
scripts/hash-password.js          Genera un hash bcrypt per ADMIN_PASSWORD
```

## 4. Installazione e avvio in locale

Requisiti: Node.js 20+ (consigliato 22), npm.

```bash
npm install
cp .env.example .env      # su Windows: copy .env.example .env
# modifica .env con i tuoi valori (vedi sezione 6)

npx prisma generate
npx prisma migrate dev --name init

npm run dev
```

L'app sarà disponibile su http://localhost:3000, il pannello admin su
http://localhost:3000/admin/login.

`npm run postinstall` esegue automaticamente `prisma generate` dopo `npm install`, ma se cambi
`prisma/schema.prisma` dovrai rieseguire `npx prisma generate` manualmente.

## 5. Database

- Schema: `prisma/schema.prisma`, modello unico `Creator`.
- SQLite non supporta un tipo enum nativo: i campi `status`, `platforms` (piattaforme
  selezionate), `platformUrls` (mappa piattaforma → URL) e `productInterests` sono salvati come
  stringa (JSON o testo semplice) e validati a livello applicativo in `src/lib/constants.ts` e
  `src/lib/validation.ts`. `src/lib/serialize-creator.ts` fa il parsing per le risposte API.
- Comandi utili:
  - `npx prisma migrate dev` — crea/aggiorna il database locale
  - `npx prisma studio` — esplora i dati con una UI
  - `npx prisma generate` — rigenera il client TypeScript dopo modifiche allo schema

### Migrazione a PostgreSQL in produzione

1. In `prisma/schema.prisma`, cambia `provider = "sqlite"` in `provider = "postgresql"`.
2. Imposta `DATABASE_URL` con la connection string Postgres (es. Supabase, Neon, RDS).
3. Esegui `npx prisma migrate deploy` sull'ambiente di produzione.

## 6. Variabili d'ambiente (`.env`)

| Variabile | Obbligatoria | Descrizione |
|---|---|---|
| `DATABASE_URL` | sì | Connessione database (SQLite in locale) |
| `ADMIN_EMAIL` | sì | Email per il login admin |
| `ADMIN_PASSWORD` | sì | Password admin: testo semplice in sviluppo, hash bcrypt in produzione (`npm run hash-password -- "password"`) |
| `SESSION_SECRET` | sì | Chiave per firmare i cookie di sessione admin (`openssl rand -base64 32`) |
| `EMAIL_PROVIDER` | no | `console` (default, stampa l'email nel terminale) o `smtp` |
| `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | solo se `EMAIL_PROVIDER=smtp` | Configurazione SMTP |
| `NEXT_PUBLIC_SITE_URL` | sì | URL pubblico del sito (usato per link email, sitemap, robots.txt) |

Non committare mai `.env` con credenziali reali; usa `.env.example` come riferimento.

## 7. Accesso al pannello admin

1. Configura `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
2. Vai su `/admin/login`.
3. In produzione, genera un hash con `npm run hash-password -- "la-tua-password"` e usa quello
   come `ADMIN_PASSWORD` invece del testo in chiaro.

## 8. Build di produzione

```bash
npm run build
npm run start
```

## 9. Deploy futuro (schema generale)

1. Provisioning di un database Postgres gestito.
2. Variabili d'ambiente configurate sulla piattaforma di hosting (Vercel, Render, Railway, VPS…).
3. `npx prisma migrate deploy` in fase di build/release.
4. Configurazione dominio + DNS + certificato TLS (gestito automaticamente dalla maggior parte
   delle piattaforme PaaS).
5. Provider SMTP transazionale reale (Resend, Postmark, SES…) al posto della modalità console.

## 10. Stato delle funzionalità

Implementato e funzionante (in un ambiente con accesso internet standard):
- Homepage, pagine About/Contact/Privacy/Terms (placeholder legale da revisionare)
- Form Early Access completo (tutte le sezioni richieste, validazione client + server)
- Persistenza su database via Prisma, referral code univoco, tracking UTM + referral
- Email di conferma (dev: log console: prod: SMTP)
- Pannello admin protetto da sessione: dashboard KPI, tabella creator con ricerca/filtri/
  ordinamento/paginazione, dettaglio creator con modifica stato e note interne
- Middleware di protezione `/admin/*`, rate limiting best-effort su login e submission,
  honeypot anti-spam sul form pubblico
- SEO: metadata, Open Graph, `robots.ts`, `sitemap.ts`

Da completare prima del lancio pubblico:
- Revisione legale di Privacy Policy e Terms
- Provider email/SMTP reale in produzione
- Qualificazione effettiva del referral (oggi il collegamento referrer→referred è salvato, ma
  nessuna logica di "reward" automatica è attiva, come richiesto)
- Rate limiting condiviso (Redis/Upstash) se distribuito su più istanze
- Test automatizzati (attualmente solo verifica manuale + lint)

## 11-bis. Changelog — Responsive design + Security audit (luglio 2026)

Intervento di miglioramento responsive e sicurezza, senza modifiche a stack, struttura o
funzionalità esistenti.

**Responsive:**
- `src/components/site-header.tsx`: aggiunto menu mobile (hamburger + drawer a comparsa) —
  prima i link di navigazione erano semplicemente nascosti sotto `sm:` senza alternativa.
- `src/app/admin/(dashboard)/layout.tsx`: aggiunta una topbar + nav orizzontale per mobile
  (la sidebar era `hidden` sotto `sm:` senza alcuna navigazione alternativa); corretto un bug
  di posizionamento (`absolute` senza contenitore `relative`) sul blocco email/logout.
- `src/app/globals.css`: font-size degli input portato a `16px` sotto i 640px per evitare lo
  zoom automatico di iOS Safari al focus; aggiunto `overflow-x: hidden` di sicurezza su
  `html`/`body`.
- `src/app/admin/(dashboard)/creators/[id]/page.tsx`: aggiunto `break-all` sugli URL dei
  profili social per evitare overflow orizzontale su schermi stretti.

**Sicurezza:**
- `src/app/admin/login/page.tsx`: sanificato il parametro `?from=` usato per il redirect
  post-login (open redirect fix) — ora sono ammessi solo path relativi che iniziano con `/`
  (esclusi quelli protocol-relative tipo `//host`).
- `next.config.ts`: aggiunti header di sicurezza standard (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Strict-Transport-Security`) su tutte le risposte.
- `src/lib/verify-origin.ts` (nuovo): helper che confronta `Origin`/`Referer` con l'host della
  richiesta, come ulteriore livello di difesa contro il CSRF (in aggiunta al cookie di sessione
  già `sameSite: "lax"`). Applicato a `/api/admin/login`, `/api/admin/logout`,
  `/api/admin/creators/[id]` (PATCH) e `/api/early-access` (POST).
- Verificato: nessun segreto/`.env` presente nel repository; `.gitignore` copre correttamente
  `.env*` e i file del database SQLite.

**Validazione eseguita:**
- `npx eslint src` — nessun errore.
- `npx tsc --noEmit` — stessi 3 errori pre-esistenti dovuti alla mancata generazione del
  client Prisma nell'ambiente sandbox (vedi nota §11 sotto), confermati identici anche sul
  commit di backup precedente alle modifiche: non sono una regressione.
- `npm run build` — fallisce allo stesso punto (tipi Prisma mancanti) per lo stesso motivo di
  rete descritto in §11. Da rieseguire su una macchina con accesso internet standard, dove
  `prisma generate` scaricherà l'engine corretto e la build dovrebbe completarsi.

## 11. Nota sull'ambiente di build usato per questo progetto

Questo progetto è stato scritto in un ambiente sandbox con accesso di rete limitato a un
elenco ristretto di domini (registry npm, GitHub, ecc.). Il binario del motore Prisma viene
scaricato da `binaries.prisma.sh`, un dominio non incluso in quella lista: di conseguenza,
`npx prisma generate` / `npx prisma migrate dev` e una build completa (`npm run build`) **non
hanno potuto essere eseguiti con successo in questo ambiente**. È stato invece verificato:
- `npm install` e lo scaffolding del progetto completano correttamente;
- `npx eslint src` passa senza errori;
- la logica dello schema (vincoli di unicità, relazione auto-referenziale sul referral) è
  stata validata con un test equivalente usando il modulo sperimentale `node:sqlite`, che non
  richiede il motore Prisma.

Su una macchina con accesso internet normale (il caso comune), `npm install` scaricherà
automaticamente il motore Prisma corretto per la piattaforma e i comandi sopra funzioneranno
senza configurazione aggiuntiva. Si raccomanda di eseguire personalmente `npx prisma generate`,
`npx prisma migrate dev` e `npm run build` come primo passo dopo aver scaricato il progetto, e
di segnalare eventuali errori residui.
