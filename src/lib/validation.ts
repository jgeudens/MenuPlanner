import type { MealFormInput } from './types';

export type MealFormErrors = Partial<
	Record<'name' | 'date' | 'rating' | 'ingredientNames', string>
>;

export type MealFormValidationResult =
	{ valid: true; data: MealFormInput } | { valid: false; errors: MealFormErrors };

export type MealFormRawInput = {
	name: string;
	date: string;
	rating: string | number;
	notes: string;
	ingredientNames: string[];
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateMealForm(raw: MealFormRawInput): MealFormValidationResult {
	const errors: MealFormErrors = {};

	const name = raw.name.trim();
	if (!name) {
		errors.name = 'Vul een naam voor het gerecht in.';
	}

	const date = raw.date.trim();
	if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(date).getTime())) {
		errors.date = 'Vul een geldige datum in.';
	}

	const rating = typeof raw.rating === 'number' ? raw.rating : Number(raw.rating);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		errors.rating = 'Kies een beoordeling van 1 tot 5.';
	}

	const ingredientNames = [...new Set(raw.ingredientNames.map((n) => n.trim()).filter(Boolean))];
	if (ingredientNames.length === 0) {
		errors.ingredientNames = 'Voeg minstens één ingrediënt toe.';
	}

	if (Object.keys(errors).length > 0) {
		return { valid: false, errors };
	}

	return {
		valid: true,
		data: {
			name,
			date,
			rating,
			notes: raw.notes.trim(),
			ingredientNames
		}
	};
}

export type IngredientNameValidationResult =
	{ valid: true; data: string } | { valid: false; error: string };

export function validateIngredientName(raw: string): IngredientNameValidationResult {
	const name = raw.trim();
	if (!name) {
		return { valid: false, error: 'Vul een naam voor het ingrediënt in.' };
	}
	return { valid: true, data: name };
}
