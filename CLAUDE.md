# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MenuPlanner (Dutch UI copy) is a private, no-accounts household meal log — not a recipe
manager or nutrition tracker. Two people share one household passcode to log dishes they've
cooked, browse history, and search past meals by ingredient. See [plan.md](plan.md) for the
full product rationale and [README.md](README.md) (Dutch) for setup instructions.

## Commands

```sh
npm run dev          # dev server
npm run check         # svelte-check (types) — run after any .svelte or route change
npm run lint          # prettier --check + eslint
npm run format        # prettier --write
npm run test:unit      # Vitest — pure logic only (stats, validation, date formatting)
npm run test:e2e       # Playwright — builds, runs preview server, drives a real browser
npm run test           # test:unit + test:e2e
npm run build && npm run preview   # production build / local preview
```

Run a single Vitest file/test: `npx vitest run src/lib/stats.test.ts` or `npx vitest run -t "test name"`.
Run a single Playwright test: `npx playwright test e2e/log-meal.e2e.ts`.

`test:e2e` builds and runs against a **real Supabase project** (via `playwright.config.ts`'s
`webServer`), so a working `.env` is required. It seeds a meal named `[e2e] ...` and deletes it
in `afterEach` via a direct REST call — if a run is interrupted, check for leftover `[e2e]`
meals in Supabase.

## Architecture

**All Supabase access is server-only.** The browser never sees a Supabase key. Every read/write
goes through `src/lib/server/{meals,ingredients,supabase}.ts`, called from `+page.server.ts`
`load`/`actions` or the one JSON endpoint (`src/routes/api/ingredients/+server.ts`). Route
`+page.svelte` files never import from `$lib/server`.

**Auth is a shared household passcode, not per-user accounts.** `src/hooks.server.ts` gates
every request except `/login` and static PWA assets, checking a signed session cookie
(`src/lib/server/auth.ts`: HMAC-SHA256 of the passcode, timing-safe compare). The same passcode
is also sent as an `x-household-passcode` header on every Supabase request
(`src/lib/server/supabase.ts`) and enforced again at the database layer via RLS — so auth is
effectively checked twice, once at the app layer and once at the DB layer.

**Database logic lives in `schema.sql`, not just the app.** Multi-table writes (creating/editing
a meal plus its ingredient list) are done via `security invoker` Postgres RPCs
(`create_meal`, `update_meal`, `search_meals_by_ingredients`) because PostgREST can't do a
client-side multi-table transaction. Ingredients are upserted case-insensitively against a
`lower(name)` unique index. `search_meals_by_ingredients` does AND-logic (a meal must contain
*all* given ingredients, via `having count(...) = cardinality(...)`). RLS policies call a
`security definer` function (`check_household_passcode`) against a passcode stored in
`app_config`, a table with no grants — the only way to read it is through that function. If you
change table shapes or add RPCs, `schema.sql` must be updated and re-run by hand in the Supabase
SQL editor; there is no migration tooling.

**Deploy target is Netlify**, via `@sveltejs/adapter-netlify` configured explicitly in
`vite.config.ts` (not `adapter-auto`) with `netlify.toml` setting the build command and `build`
publish directory. Four env vars are required at runtime and at e2e-test time: `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY` (never the secret key — it bypasses RLS), `HOUSEHOLD_PASSCODE`,
`SESSION_SECRET`.

**PWA**: `@vite-pwa/sveltekit` (configured in `vite.config.ts`) generates the manifest/service
worker for Android "Add to Home Screen" support. A build-time warning about a `prerendered/**`
glob not matching anything is expected — this app has no prerendered routes — and is safe to
ignore.

## Conventions

- User-facing strings (validation errors, UI copy, aria-labels) are in Dutch — match existing
  phrasing style when adding new ones.
- `src/lib/*.ts` (stats, validation, utils) is pure, framework-free logic with colocated
  `*.test.ts` files — keep DB/Supabase concerns out of these.
- Types shared between server and UI live in `src/lib/types.ts`.
