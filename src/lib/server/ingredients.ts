import type { Db } from './supabase';
import type { Ingredient, IngredientWithUsage } from '$lib/types';

export async function searchIngredients(db: Db, query: string, limit = 10): Promise<Ingredient[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const { data, error } = await db
		.from('ingredients')
		.select('id, name')
		.ilike('name', `${trimmed}%`)
		.order('name')
		.limit(limit);

	if (error) throw error;
	return data ?? [];
}

export async function getIngredientsByIds(db: Db, ids: string[]): Promise<Ingredient[]> {
	if (ids.length === 0) return [];

	const { data, error } = await db.from('ingredients').select('id, name').in('id', ids);
	if (error) throw error;
	return data ?? [];
}

type IngredientUsageRow = {
	id: string;
	name: string;
	meal_ingredients: { count: number }[];
};

export async function listIngredients(db: Db): Promise<IngredientWithUsage[]> {
	const { data, error } = await db
		.from('ingredients')
		.select('id, name, meal_ingredients(count)')
		.order('name');

	if (error) throw error;
	return ((data as unknown as IngredientUsageRow[]) ?? []).map((row) => ({
		id: row.id,
		name: row.name,
		mealCount: row.meal_ingredients[0]?.count ?? 0
	}));
}

/** Renames an ingredient, merging into an existing one on name collision. Returns
 * true when a merge happened, false for a plain rename. */
export async function renameIngredient(db: Db, id: string, newName: string): Promise<boolean> {
	const { data, error } = await db.rpc('rename_ingredient', {
		p_ingredient_id: id,
		p_new_name: newName
	});

	if (error) throw error;
	return data as boolean;
}
