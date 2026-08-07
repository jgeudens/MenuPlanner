-- MenuPlanner: reusable function/trigger updates.
-- Unlike schema.sql (one-time setup: tables, policies, initial data), everything
-- in this file is safe to re-run against a live database at any time — it only
-- uses CREATE OR REPLACE FUNCTION / CREATE OR REPLACE TRIGGER / GRANT, none of
-- which error or duplicate on an existing database.
--
-- Run this in full in the Supabase SQL editor whenever a function body below
-- changes (e.g. after pulling a commit that touches create_meal/update_meal/etc).
-- Run it against every environment that needs the update (dev/CI project, prod).
--
-- IMPORTANT: this is a hand-maintained copy of the function/trigger/grant
-- statements also present in schema.sql (the source of truth for full db setup).
-- When you edit a function in schema.sql, copy the same edit here.

create or replace function check_household_passcode(input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (select 1 from app_config where passcode = input);
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create or replace trigger meals_set_updated_at
before update on meals
for each row execute function set_updated_at();

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

-- Create a meal together with its ingredients in one atomic call (PostgREST
-- can't run a client-side multi-table transaction, so this does it server
-- side). Ingredient names are trimmed and lowercased, then upserted
-- case-insensitively against the ingredients_name_lower_idx unique index,
-- creating new ones as needed.
-- security invoker: runs as the calling (anon) role, so the RLS policies
-- above are still enforced on every insert this function performs.
create or replace function create_meal(
	p_name text,
	p_date date,
	p_rating smallint,
	p_notes text,
	p_ingredient_names text[]
)
returns meals
language plpgsql
security invoker
as $$
declare
	v_meal meals;
	v_ingredient_name text;
	v_ingredient ingredients;
begin
	insert into meals (name, date, rating, notes)
	values (trim(p_name), p_date, p_rating, nullif(trim(p_notes), ''))
	returning * into v_meal;

	foreach v_ingredient_name in array p_ingredient_names loop
		insert into ingredients (name)
		values (lower(trim(v_ingredient_name)))
		on conflict (lower(name)) do update set name = ingredients.name
		returning * into v_ingredient;

		insert into meal_ingredients (meal_id, ingredient_id)
		values (v_meal.id, v_ingredient.id)
		on conflict do nothing;
	end loop;

	return v_meal;
end;
$$;

-- Same as create_meal, but replaces an existing meal's fields and its full
-- ingredient list (deletes and re-inserts the meal_ingredients rows).
create or replace function update_meal(
	p_meal_id uuid,
	p_name text,
	p_date date,
	p_rating smallint,
	p_notes text,
	p_ingredient_names text[]
)
returns meals
language plpgsql
security invoker
as $$
declare
	v_meal meals;
	v_ingredient_name text;
	v_ingredient ingredients;
begin
	update meals
	set name = trim(p_name),
		date = p_date,
		rating = p_rating,
		notes = nullif(trim(p_notes), '')
	where id = p_meal_id
	returning * into v_meal;

	if not found then
		raise exception 'Meal not found' using errcode = 'P0002';
	end if;

	delete from meal_ingredients where meal_id = p_meal_id;

	foreach v_ingredient_name in array p_ingredient_names loop
		insert into ingredients (name)
		values (lower(trim(v_ingredient_name)))
		on conflict (lower(name)) do update set name = ingredients.name
		returning * into v_ingredient;

		insert into meal_ingredients (meal_id, ingredient_id)
		values (v_meal.id, v_ingredient.id)
		on conflict do nothing;
	end loop;

	return v_meal;
end;
$$;

-- Explicit grants (re-granting an already-granted privilege is a no-op, not an error).
grant execute on function check_household_passcode(text) to anon;
grant execute on function search_meals_by_ingredients(uuid[]) to anon;
grant execute on function create_meal(text, date, smallint, text, text[]) to anon;
grant execute on function update_meal(uuid, text, date, smallint, text, text[]) to anon;
