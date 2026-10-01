import type { Db } from './supabase';
import type {
	MealFormInput,
	MealStatsSource,
	MealSuggestion,
	MealWithIngredients
} from '$lib/types';

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

export async function listRecentMeals(
	db: Db,
	limit: number,
	offset: number
): Promise<MealWithIngredients[]> {
	const { data, error } = await db
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.order('date', { ascending: false })
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) throw error;
	return (data as unknown as MealRow[]).map(mapMealRow);
}

export async function getMeal(db: Db, id: string): Promise<MealWithIngredients | null> {
	const { data, error } = await db
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.eq('id', id)
		.maybeSingle();

	if (error) throw error;
	return data ? mapMealRow(data as unknown as MealRow) : null;
}

export async function createMeal(db: Db, input: MealFormInput): Promise<string> {
	const { data, error } = await db.rpc('create_meal', {
		p_name: input.name,
		p_date: input.date,
		p_rating: input.rating,
		p_notes: input.notes,
		p_ingredient_names: input.ingredientNames
	});

	if (error) throw error;
	return (data as { id: string }).id;
}

export async function updateMeal(db: Db, id: string, input: MealFormInput): Promise<void> {
	const { error } = await db.rpc('update_meal', {
		p_meal_id: id,
		p_name: input.name,
		p_date: input.date,
		p_rating: input.rating,
		p_notes: input.notes,
		p_ingredient_names: input.ingredientNames
	});

	if (error) throw error;
}

export async function deleteMeal(db: Db, id: string): Promise<void> {
	const { error } = await db.from('meals').delete().eq('id', id);
	if (error) throw error;
}

export async function searchMealsByIngredients(
	db: Db,
	ingredientIds: string[]
): Promise<MealWithIngredients[]> {
	if (ingredientIds.length === 0) return [];

	const { data: matches, error: matchError } = await db.rpc('search_meals_by_ingredients', {
		ingredient_ids: ingredientIds
	});
	if (matchError) throw matchError;

	const ids = (matches as { id: string }[]).map((m) => m.id);
	if (ids.length === 0) return [];

	const { data, error } = await db
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.in('id', ids)
		.order('date', { ascending: false });

	if (error) throw error;
	return (data as unknown as MealRow[]).map(mapMealRow);
}

export async function searchMealNameSuggestions(
	db: Db,
	query: string,
	limit = 10
): Promise<MealSuggestion[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const { data, error } = await db
		.from('meals')
		.select(MEAL_WITH_INGREDIENTS_SELECT)
		.ilike('name', `${trimmed}%`)
		.order('date', { ascending: false })
		.order('created_at', { ascending: false })
		.limit(limit * 3);

	if (error) throw error;

	const seen = new Set<string>();
	const suggestions: MealSuggestion[] = [];
	for (const row of data as unknown as MealRow[]) {
		const key = row.name.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);

		const { name, rating, notes, ingredients } = mapMealRow(row);
		suggestions.push({ name, rating, notes, ingredients });
		if (suggestions.length >= limit) break;
	}
	return suggestions;
}

export async function getAllMealsForStats(db: Db): Promise<MealStatsSource[]> {
	const { data, error } = await db
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
