import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { validateIngredientName } from '$lib/validation';
import { listIngredients, renameIngredient } from '$lib/server/ingredients';

export const load: PageServerLoad = async () => {
	return { ingredients: await listIngredients() };
};

export const actions: Actions = {
	rename: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const result = validateIngredientName(String(data.get('name') ?? ''));

		if (!result.valid) {
			return fail(400, { errorId: id, error: result.error });
		}

		const merged = await renameIngredient(id, result.data);
		redirect(303, merged ? '/admin?toast=ingredient-merged' : '/admin?toast=ingredient-renamed');
	}
};
