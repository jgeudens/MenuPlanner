import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateMealForm } from '$lib/validation';
import { createMeal } from '$lib/server/meals';

export const actions: Actions = {
	default: async ({ request, locals }) => {
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

		await createMeal(locals.db, result.data);
		redirect(303, '/?toast=meal-saved');
	}
};
