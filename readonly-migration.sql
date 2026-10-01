-- One-off migration for an EXISTING database: adds read-only passcode support.
-- Run once in the Supabase SQL editor of each project (prod and non-prod).
-- Replace 'REPLACE_WITH_YOUR_READONLY_PASSCODE' first. Do not re-run.

alter table app_config add column readonly_passcode text;
update app_config set readonly_passcode = 'REPLACE_WITH_YOUR_READONLY_PASSCODE';

create or replace function check_household_readonly_passcode(input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1 from app_config
		where readonly_passcode is not null and readonly_passcode <> '' and readonly_passcode = input
	);
$$;

grant execute on function check_household_readonly_passcode(text) to anon;

drop policy "household access" on meals;
drop policy "household access" on ingredients;
drop policy "household access" on meal_ingredients;

create policy "household read" on meals for select
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
	or check_household_readonly_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

create policy "household insert" on meals for insert
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household update" on meals for update
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'))
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household delete" on meals for delete
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household read" on ingredients for select
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
	or check_household_readonly_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

create policy "household insert" on ingredients for insert
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household update" on ingredients for update
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'))
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household delete" on ingredients for delete
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household read" on meal_ingredients for select
using (
	check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
	or check_household_readonly_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode')
);

create policy "household insert" on meal_ingredients for insert
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household update" on meal_ingredients for update
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'))
with check (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));

create policy "household delete" on meal_ingredients for delete
using (check_household_passcode(current_setting('request.headers', true)::json ->> 'x-household-passcode'));
