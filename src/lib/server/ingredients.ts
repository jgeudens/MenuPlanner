import { supabase } from './supabase';
import type { Ingredient } from '$lib/types';

export async function searchIngredients(query: string, limit = 10): Promise<Ingredient[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const { data, error } = await supabase
		.from('ingredients')
		.select('id, name')
		.ilike('name', `${trimmed}%`)
		.order('name')
		.limit(limit);

	if (error) throw error;
	return data ?? [];
}
