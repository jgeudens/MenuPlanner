# MenuPlanner — Application Overview

## What it is

A private, household-use application for logging meals you've actually cooked — not a recipe manager, and not a nutrition tracker. Think of it as a running journal of your kitchen: every dish you make gets a quick entry, and over time that log becomes a searchable source of inspiration, a record of what's worked, and a small window into your own cooking habits.

The core idea is simple: instead of scrolling through bookmarked recipes or trying to remember "what did we make with that eggplant last month," you have your own history to search and browse.

Built for two people sharing a kitchen, with no need for accounts or logins — just a lightweight, always-available log both of you can add to and pull from.

------

## Core functionality

### Logging a meal

Adding an entry takes seconds: name the dish, confirm the date, tag the ingredients that went into it, give it a rating, and optionally leave a note. Ingredients are added through autocomplete, drawing from everything you've logged before — so your ingredient list naturally builds itself as you cook, and typing "chick—" surfaces "chicken thighs" from three weeks ago instead of forcing you to retype it.

### Browsing the log

A simple, reverse-chronological feed of everything you've made — a scrollable record of your recent cooking, each entry showing what it was, when, how it turned out, and what went into it.

### Searching by ingredient

This is where the log earns its keep. Stuck for dinner ideas with chicken thighs and half a lemon in the fridge? Search those two ingredients and see everything you've made with them before — pulled straight from your own successful cooking history, not a generic recipe database.

### Stats

A quiet layer of insight sitting on top of the log, with no extra effort required to generate it:

- How many meals you've logged in total, and your average rating
- Your top-rated dishes
- Dishes you keep coming back to
- The ingredients that show up most often in your cooking

None of this needs to be manually tracked — it's simply computed from the meals you've already logged.

### Editing and correcting

Meals can be edited or removed after the fact, so a typo or a forgotten ingredient is never a permanent record.

------

## What makes it useful over time

The value compounds. A handful of entries is just a list; a hundred entries is a genuine personal cookbook of things you know you like, searchable by what's actually in your fridge — and unlike a bookmarked recipe, every entry represents something you've actually made and rated, not just something that looked good in a photo.

## Planned refinements (once the core is in daily use)

- **Repeat-cook** — re-log a favorite with one tap instead of re-entering it
- **"Haven't made in a while"** — gentle resurfacing of good dishes you've drifted away from
- **"Surprise me"** — a random nudge when you don't know what to cook, optionally scoped to ingredients on hand
- **A "never again" flag** — separate from rating, so a low-rated experiment doesn't get accidentally resurfaced as a suggestion
- **Photos** — a visual trace of your cooking alongside the text
- **Tags** (weeknight, guests, one-pot, etc.) — an additional filter dimension beyond ingredients
- **A shopping list generated from a past meal** — one tap to turn "we're making this again" into a checklist

These are deliberately left for later — the goal is a working, useful core first, with refinements added only once real use shows which of them are actually missed.



## Household Meal Log — Full Tech Stack

**Frontend**
- **SvelteKit** (Vite-based) — file-based routing, `+page.svelte` / `+page.server.js` for data loading
- **TypeScript** — worth it even at this scale; catches schema mismatches with Supabase early
- **Tailwind CSS** — utility-first styling, pairs cleanly with Svelte's scoped `<style>` blocks when you need one-off overrides
- **vite-plugin-pwa** — generates manifest + service worker, handles Android "Add to Home Screen" and offline caching

**Backend / Data**
- **Supabase** (Postgres) — hosted DB, REST + realtime API, auto-generated from your schema
- **`@supabase/supabase-js`** client — used directly in SvelteKit load functions and component actions
- **Row Level Security (RLS)** — simple policy gated by a shared household passcode/secret, since you don't want real auth but also don't want an open write endpoint

**Hosting / Deploy**
- **Vercel** or **Netlify** — free tier, auto-deploy from GitHub on push, SvelteKit adapter for either is first-party

**Dev tooling**
- **ESLint** + `eslint-plugin-svelte` + `@typescript-eslint`
- **Prettier** + `prettier-plugin-svelte`
- **Vitest** — unit/component tests (scaffolded by SvelteKit's `create-svelte`)
- **Playwright** — e2e tests, also scaffolded by default; useful for testing the log-a-meal flow end to end

**State / data flow**
- Svelte **stores** for lightweight shared state (current user picker, in-progress shopping list)
- No external state library needed — stores + SvelteKit load functions cover this app's whole surface area

**Schema** — unchanged from your original design (`meals`, `ingredients`, `meal_ingredients`, optional `tags`/`meal_tags`, later `shopping_list_items`)

**Not included, deliberately**
- No native wrapper (Capacitor/Flutter/RN) — Android Chrome PWA covers install-to-home-screen, offline, and camera access without one
- No dedicated state management library (Redux/Zustand-equivalent) — unnecessary at this scale
- No real auth system — name picker + RLS passcode is enough for 2 trusted users


## Functional overview — household meal log (updated)

### Core entities
- **Meal entry** — a single instance of a dish cooked (name, date, rating, ingredients, notes)
- **Ingredient** — reusable tag, autocompleted from history

### MVP functionality (Phase 1)

**Log a meal**
- Enter dish name
- Set date (defaults to today)
- Add ingredients via autocomplete (type-ahead from existing ingredient list, or create new)
- Rate 1–5
- Optional free-text notes
- Save

**Browse meals**
- Chronological feed, most recent first
- Each entry shows: name, date, rating, ingredient tags

**Search by ingredient**
- Multi-select ingredient filter (AND logic — meals containing all selected ingredients)
- Results show match count / last-made date

**Basic stats**
- Total meals logged
- Average rating
- Top-rated meals
- Most-repeated meals (by name, count of entries)
- Most-used ingredients

**Edit / delete**
- Edit any past entry
- Delete an entry

### Phase 2 — high-value additions
- **Repeat-cook** — one tap to re-log a past meal with today's date
- **"Haven't made in a while"** — surface favorites not cooked recently
- **"Surprise me"** — random pick, optionally filtered by ingredient
- **Never again flag** — separate from rating, excludes from suggestions
- **Photo attachment** per meal

### Phase 3 — optional, evaluate after real use
- Tags (weeknight, guests, one-pot, etc.) — separate from ingredients
- Season/month auto-tagging, searchable
- Shopping list generated from a past meal, with checkboxes
- Ingredient merge/cleanup tool (handles "tomato" vs "tomatoes" drift)
- Cook cadence/streak stat

### Implementation sequencing suggestion
1. Data model + log/browse/edit/delete (no search yet) — get the core loop working
2. Ingredient autocomplete + search
3. Stats view — pure read/aggregation on data you already have by this point
4. Phase 2 features, prioritized by what you actually miss during real use
5. Phase 3 — only once specific pain points show up

Also drops the `cooked_by` field and the "per-person breakdown" stat from the schema/data side, if you want that reflected next time we touch the database overview.
