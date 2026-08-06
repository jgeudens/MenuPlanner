import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { validateMealForm } from '$lib/validation';
import { getMeal, updateMeal, deleteMeal } from '$lib/server/meals';

export const load: PageServerLoad = async ({ params }) => {
	const meal = await getMeal(params.id);
	if (!meal) error(404, 'Gerecht niet gevonden.');
	return { meal };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();

		const raw = {
			name: String(data.get('name') ?? ''),
			date: String(data.get('date') ?? ''),
			rating: String(data.get('rating') ?? ''),
			notes: String(data.get('notes') ?? ''),
			ingredientNames: data.getAll('ingredientNames').map(String)
		};

		const result = validateMealForm(raw);

		if (!result.valid) {
			return fail(400, { errors: result.errors, values: raw });
		}

		await updateMeal(params.id, result.data);
		redirect(303, '/?toast=meal-updated');
	},

	delete: async ({ params }) => {
		await deleteMeal(params.id);
		redirect(303, '/?toast=meal-deleted');
	}
};
