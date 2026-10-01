import type { PageServerLoad } from './$types';
import { searchMealsByIngredients } from '$lib/server/meals';
import { getIngredientsByIds } from '$lib/server/ingredients';

export const load: PageServerLoad = async ({ url, locals }) => {
	const ingredientIds = url.searchParams.getAll('ingredient');

	const [meals, selectedIngredients] = await Promise.all([
		searchMealsByIngredients(locals.db, ingredientIds),
		getIngredientsByIds(locals.db, ingredientIds)
	]);

	return { meals, selectedIngredients, hasSearched: ingredientIds.length > 0 };
};
