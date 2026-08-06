import { supabase } from './supabase';
import type { MealFormInput, MealStatsSource, MealWithIngredients } from '$lib/types';

const MEAL_WITH_INGREDIENTS_SELECT =
	'id, name, date, rating, notes, meal_ingredients(ingredients(id, name))';

type MealRow = {
	id: string;
	name: string;
	date: string;
	rating: number;
	notes: string | null;
	meal_ingredients: { ingredients: { id: string; name: string } }[];
};

function mapMealRow(row: MealRow): MealWithIngredients {
	return {
		id: row.id,
		name: row.name,
		date: row.date,
		rating: row.rating,
		notes: row.notes,
		ingredients: row.meal_ingredients
			.map((mi) => mi.ingredients)
			.sort((a, b) => a.name.localeCompare(b.name, 'nl'))
	};
}

export async function listRecentMeals(limit: number, offset: number): Promise<MealWithIngredients[]> {
	const { data, error } = await supabase
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.order('date', { ascending: false })
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) throw error;
	return (data as unknown as MealRow[]).map(mapMealRow);
}

export async function getMeal(id: string): Promise<MealWithIngredients | null> {
	const { data, error } = await supabase
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.eq('id', id)
		.maybeSingle();

	if (error) throw error;
	return data ? mapMealRow(data as unknown as MealRow) : null;
}

export async function createMeal(input: MealFormInput): Promise<string> {
	const { data, error } = await supabase.rpc('create_meal', {
		p_name: input.name,
		p_date: input.date,
		p_rating: input.rating,
		p_notes: input.notes,
		p_ingredient_names: input.ingredientNames
	});

	if (error) throw error;
	return (data as { id: string }).id;
}

export async function updateMeal(id: string, input: MealFormInput): Promise<void> {
	const { error } = await supabase.rpc('update_meal', {
		p_meal_id: id,
		p_name: input.name,
		p_date: input.date,
		p_rating: input.rating,
		p_notes: input.notes,
		p_ingredient_names: input.ingredientNames
	});

	if (error) throw error;
}

export async function deleteMeal(id: string): Promise<void> {
	const { error } = await supabase.from('meals').delete().eq('id', id);
	if (error) throw error;
}

export async function searchMealsByIngredients(
	ingredientIds: string[]
): Promise<MealWithIngredients[]> {
	if (ingredientIds.length === 0) return [];

	const { data: matches, error: matchError } = await supabase.rpc('search_meals_by_ingredients', {
		ingredient_ids: ingredientIds
	});
	if (matchError) throw matchError;

	const ids = (matches as { id: string }[]).map((m) => m.id);
	if (ids.length === 0) return [];

	const { data, error } = await supabase
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.in('id', ids)
		.order('date', { ascending: false });

	if (error) throw error;
	return (data as unknown as MealRow[]).map(mapMealRow);
}

export async function getAllMealsForStats(): Promise<MealStatsSource[]> {
	const { data, error } = await supabase
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.order('date', { ascending: false });

	if (error) throw error;
	return (data as unknown as MealRow[]).map((row) => ({
		id: row.id,
		name: row.name,
		date: row.date,
		rating: row.rating,
		ingredients: row.meal_ingredients.map((mi) => ({ name: mi.ingredients.name }))
	}));
}
