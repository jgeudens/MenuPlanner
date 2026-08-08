# Journal

Anti-chronological developer notes on user-facing and structural changes to
MenuPlanner. Tooling-only changes (CI, dependencies, lint/format config) are
not logged here — see git log for those.

## 2026-08-08 — Disable browser autocomplete on remaining text inputs

Added `autocomplete="off"` to the admin ingredient filter/rename inputs and the meal
notes textareas. `IngredientPicker` and `MealNameInput` already had it; date and
password inputs were left alone since they don't use the same suggestion dropdown.

## 2026-08-08 — Keep focus on ingredient input after adding an ingredient

Fixed a bug where clicking a suggestion or "add new" button in the ingredient picker
unmounted its own dropdown without refocusing the text input. Adding several
ingredients in a row required re-clicking the input each time; focus is now restored
automatically.

## 2026-08-07 — Remove logout button and action

Removed the "Uitloggen" button (desktop and mobile nav) and its server action. The app
uses one shared, long-lived household passcode session with no per-user accounts, so
logging out served no purpose.

## 2026-08-07 — Make navbar responsive with mobile hamburger menu

Fixed horizontal page overflow on phone-width viewports, where the nav link row didn't
wrap. Below `md` breakpoint the inline links are now replaced by a hamburger toggle and
a stacked mobile panel that closes on navigation or Escape; desktop layout is unchanged.

## 2026-08-07 — Add admin page to rename and merge ingredients

Added a `/admin` section to rename an ingredient or merge it into an existing one
(renaming to a name that already exists repoints all its meals to the survivor and
deletes the duplicate, with a confirmation prompt). Backed by a new
`rename_ingredient` security-invoker RPC.

## 2026-08-07 — Add English tagline and scraper-safe contact to login page, drop em-dashes

Added an English tagline to the login page and rendered the contact email via canvas
instead of raw DOM text to deter scrapers. Also replaced em-dashes with plain
punctuation across page titles, the login page, and stats copy.

## 2026-08-07 — Normalize ingredient names to lowercase and add reusable functions.sql

`create_meal`/`update_meal` now lowercase (not just trim) ingredient names before the
case-insensitive upsert. Split the rerunnable parts of `schema.sql` (functions,
triggers, grants) into a new `functions.sql` so RPC changes can be pushed to a live
database without rerunning full setup.

## 2026-08-07 — Replace browser autocomplete with DB-backed meal name suggestions

Added a custom suggestion dropdown for the meal-name field backed by meal history.
Selecting a suggestion on the new-meal page repeats that dish (fills ingredients,
rating, and notes, leaves the date); on the edit page it only fills the name.

## 2026-08-07 — Add rate limiting to login to stop passcode brute-forcing

Since the household passcode is the sole auth factor, added in-memory IP lockout:
15 minutes locked out after 5 failed login attempts.

## 2026-08-07 — Rebrand Pantry Log to MenuPlanner

Renamed the app's visible name, PWA manifest, cache name, and session cookie from the
working title "Pantry Log" to "MenuPlanner".

## 2026-08-06 — Add PWA icons and an on-brand favicon

Added blue "P"-mark PWA icons (192/512/512-maskable) and replaced the default
SvelteKit favicon, so the installed PWA has proper branding.

## 2026-08-06 — Add edit/delete, ingredient search, and stats routes

Added `/meals/[id]/edit` (update and delete with confirmation), `/search` (multi-
ingredient AND search via a shareable GET URL), and `/stats` (totals, average rating,
top-rated, most-repeated, and most-used ingredients).

## 2026-08-06 — Add meal data layer, browse feed, and log-a-meal flow

Added the core data/validation/stats libraries, the server query layer with
`create_meal`/`update_meal` RPCs, the `MealCard`/`RatingInput`/`IngredientPicker`/
`FormField` components, and the `/` browse feed plus `/meals/new` route.

## 2026-08-06 — Add database schema, passcode auth, blue theme, and PWA config

Introduced `schema.sql` (meals/ingredients/meal_ingredients tables, RLS gated by a
shared household passcode, `search_meals_by_ingredients()` RPC), the two-layer
passcode auth gate, the blue theme/nav/toast system, and PWA manifest wiring.
