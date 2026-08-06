import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchIngredients } from '$lib/server/ingredients';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const ingredients = await searchIngredients(q);
	return json(ingredients);
};
