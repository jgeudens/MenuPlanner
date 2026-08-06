-- Pantry Log database schema
-- Run this once, in full, in the Supabase SQL editor (Project → SQL Editor → New query).
-- Before running: replace 'REPLACE_WITH_YOUR_PASSCODE' below with your own household
-- passcode. This same value must also be set as HOUSEHOLD_PASSCODE in the app's .env.

create extension if not exists pgcrypto;

-- Shared secret store. RLS is enabled with no policies granted to anon, so this
-- table is never readable directly via the Data API — only through the
-- SECURITY DEFINER function below.
create table app_config (
	id boolean primary key default true,
	passcode text not null,
	constraint app_config_singleton check (id)
);
insert into app_config (id, passcode) values (true, 'REPLACE_WITH_YOUR_PASSCODE');

create or replace function check_household_passcode(input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (select 1 from app_config where passcode = input);
$$;

-- Core tables

create table ingredients (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	created_at timestamptz not null default now()
);
create unique index ingredients_name_lower_idx on ingredients (lower(name));

create table meals (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	date date not null default current_date,
	rating smallint not null check (rating between 1 and 5),
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);
create index meals_date_idx on meals (date desc);

create table meal_ingredients (
	meal_id uuid not null references meals (id) on delete cascade,
	ingredient_id uuid not null references ingredients (id) on delete restrict,
	primary key (meal_id, ingredient_id)
);
create index meal_ingredients_ingredient_idx on meal_ingredients (ingredient_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create trigger meals_set_updated_at
before update on meals
for each row execute function set_updated_at();

-- Row Level Security
-- Gated by a shared household passcode sent as the `x-household-passcode`
-- request header (set as a static header on the server-side Supabase client,
-- see src/lib/server/supabase.ts). There is no per-user auth — this is a
-- 2-person trusted household app.

alter table app_config enable row level security;
alter table meals enable row level security;
alter table ingredients enable row level security;
alter table meal_ingredients enable row level security;

create policy "household access" on meals for all
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
)
with check (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

create policy "household access" on ingredients for all
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
)
with check (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

create policy "household access" on meal_ingredients for all
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
)
with check (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

-- AND-logic ingredient search: returns meals that contain ALL given ingredients.
create or replace function search_meals_by_ingredients(ingredient_ids uuid[])
returns setof meals
language sql
stable
security invoker
as $$
	select m.*
	from meals m
	join meal_ingredients mi on mi.meal_id = m.id
	where mi.ingredient_id = any(ingredient_ids)
	group by m.id
	having count(distinct mi.ingredient_id) = cardinality(ingredient_ids)
	order by m.date desc;
$$;

-- Explicit grants.
-- Required because "Automatically expose new tables" is disabled on the
-- Supabase project (recommended: it also guarantees app_config never gets
-- exposed by accident — it intentionally has no grant here).
grant usage on schema public to anon;
grant select, insert, update, delete on meals, ingredients, meal_ingredients to anon;
grant execute on function check_household_passcode(text) to anon;
grant execute on function search_meals_by_ingredients(uuid[]) to anon;
