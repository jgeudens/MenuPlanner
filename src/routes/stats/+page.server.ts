import type { PageServerLoad } from './$types';
import { getAllMealsForStats } from '$lib/server/meals';
import {
	computeAverageRating,
	computeMostRepeated,
	computeMostUsedIngredients,
	computeTopRated,
	computeTotalMeals
} from '$lib/stats';

export const load: PageServerLoad = async ({ locals }) => {
	const meals = await getAllMealsForStats(locals.db);

	return {
		totalMeals: computeTotalMeals(meals),
		averageRating: computeAverageRating(meals),
		topRated: computeTopRated(meals, 10),
		mostRepeated: computeMostRepeated(meals, 10),
		mostUsedIngredients: computeMostUsedIngredients(meals, 10)
	};
};
