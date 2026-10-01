import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchMealNameSuggestions } from '$lib/server/meals';

export const GET: RequestHandler = async ({ url, locals }) => {
	const q = url.searchParams.get('q') ?? '';
	const suggestions = await searchMealNameSuggestions(locals.db, q);
	return json(suggestions);
};
