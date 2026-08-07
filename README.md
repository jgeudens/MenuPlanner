# MenuPlanner

Een privélogboek van gerechten die je echt hebt gekookt — geen receptenbeheer, geen
voedingstracker. Log wat je hebt gemaakt, blader terug door je geschiedenis, en zoek op
ingrediënt als je niet weet wat je vanavond moet koken. Gebouwd voor twee mensen die samen
een keuken delen, zonder accounts — één gedeelde toegangscode.

Zie [plan.md](./plan.md) voor het volledige productplan.

## Techniek

SvelteKit + TypeScript + Tailwind CSS, met Supabase (Postgres) als backend. Alle
Supabase-toegang loopt via de server (load functions/form actions) — de browser krijgt nooit
een Supabase-sleutel te zien. Toegang is niet met echte accounts geregeld, maar met één
gedeelde huishoud-toegangscode die zowel de app (sessie-cookie) als de database
(Row Level Security) afschermt.

## Aan de slag

### 1. Installeren

```sh
npm install
```

### 2. Supabase-project opzetten

1. Maak een project aan op [supabase.com](https://supabase.com). Kies bij de geavanceerde
   instellingen: **"Automatically expose new tables" uit** (we regelen toegang zelf via
   expliciete `grant`-statements in `schema.sql`) en **"Enable automatic RLS" aan**.
2. Open de SQL Editor in het Supabase-dashboard, plak de volledige inhoud van
   [`schema.sql`](./schema.sql) erin, en vervang eerst `REPLACE_WITH_YOUR_PASSCODE` door je
   eigen toegangscode (verzin zelf iets — dit hoeft geen Supabase-waarde te zijn).
3. Voer het script uit.

### 3. Omgevingsvariabelen

```sh
cp .env.example .env
```

Vul in `.env` in:

- `SUPABASE_URL` en `SUPABASE_PUBLISHABLE_KEY` — Project Settings → API in het Supabase-dashboard.
  Gebruik de **publishable key**, niet de secret key (die omzeilt Row Level Security).
- `HOUSEHOLD_PASSCODE` — exact dezelfde toegangscode als in stap 2.
- `SESSION_SECRET` — een willekeurige lange string, bijvoorbeeld met
  `openssl rand -hex 32`.

### 4. Development server

```sh
npm run dev
```

Open de app en log in met je toegangscode.

## Testen

```sh
npm run check       # svelte-check (types)
npm run lint         # prettier + eslint
npm run test:unit    # Vitest — pure logica (stats, validatie, datumformattering)
npm run test:e2e     # Playwright — logt een gerecht end-to-end in een echte browser
npm run test         # test:unit + test:e2e
```

`test:e2e` draait tegen een productie-build (`npm run build && npm run preview`) en heeft dus
een werkend Supabase-project en ingevulde `.env` nodig. De test maakt een uniek
`[e2e]`-gerecht aan en ruimt dat na afloop weer op.

## Bouwen en deployen

```sh
npm run build
npm run preview   # lokaal de productie-build bekijken
```

Het project gebruikt `@sveltejs/adapter-auto`, dat zonder aanpassingen werkt op zowel
[Vercel](https://vercel.com) als [Netlify](https://netlify.com): koppel de GitHub-repo,
zet dezelfde vier omgevingsvariabelen (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`HOUSEHOLD_PASSCODE`, `SESSION_SECRET`) in de projectinstellingen, en deploy.

## Installeren als app (Android/Chrome)

De app is een PWA. Open de site in Chrome op Android en kies **"Toevoegen aan startscherm"**
voor een app-icoon en basale offline-ondersteuning van de interface.
