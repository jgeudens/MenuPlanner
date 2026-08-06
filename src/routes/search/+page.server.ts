import type { PageServerLoad } from './$types';
import { searchMealsByIngredients } from '$lib/server/meals';
import { getIngredientsByIds } from '$lib/server/ingredients';

export const load: PageServerLoad = async ({ url }) => {
	const ingredientIds = url.searchParams.getAll('ingredient');

	const [meals, selectedIngredients] = await Promise.all([
		searchMealsByIngredients(ingredientIds),
		getIngredientsByIds(ingredientIds)
	]);

	return { meals, selectedIngredients, hasSearched: ingredientIds.length > 0 };
};
