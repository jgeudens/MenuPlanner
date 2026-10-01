import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchIngredients } from '$lib/server/ingredients';

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q') ?? '';
	const ingredients = await searchIngredients(locals.db, q);
	return json(ingredients);
};
