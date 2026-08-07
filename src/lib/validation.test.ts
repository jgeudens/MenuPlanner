import { describe, expect, it } from 'vitest';
import { validateIngredientName, validateMealForm, type MealFormRawInput } from './validation';

function raw(overrides: Partial<MealFormRawInput> = {}): MealFormRawInput {
	return {
		name: 'Spaghetti',
		date: '2026-08-06',
		rating: 4,
		notes: '',
		ingredientNames: ['tomaat'],
		...overrides
	};
}

describe('validateMealForm', () => {
	it('accepts a valid minimal payload', () => {
		const result = validateMealForm(raw());
		expect(result.valid).toBe(true);
	});

	it('rejects an empty name', () => {
		const result = validateMealForm(raw({ name: '' }));
		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.errors.name).toBeDefined();
	});

	it('rejects a whitespace-only name', () => {
		const result = validateMealForm(raw({ name: '   ' }));
		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.errors.name).toBeDefined();
	});

	it('rejects a missing or invalid date', () => {
		expect(validateMealForm(raw({ date: '' })).valid).toBe(false);
		expect(validateMealForm(raw({ date: 'not-a-date' })).valid).toBe(false);
		expect(validateMealForm(raw({ date: '2026-13-40' })).valid).toBe(false);
	});

	it('rejects a rating outside 1-5', () => {
		expect(validateMealForm(raw({ rating: 0 })).valid).toBe(false);
		expect(validateMealForm(raw({ rating: 6 })).valid).toBe(false);
	});

	it('rejects a non-integer rating', () => {
		expect(validateMealForm(raw({ rating: 3.5 })).valid).toBe(false);
	});

	it('rejects zero ingredients', () => {
		const result = validateMealForm(raw({ ingredientNames: [] }));
		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.errors.ingredientNames).toBeDefined();
	});

	it('rejects ingredients that are only whitespace', () => {
		const result = validateMealForm(raw({ ingredientNames: ['   ', ''] }));
		expect(result.valid).toBe(false);
	});

	it('trims name and notes whitespace', () => {
		const result = validateMealForm(raw({ name: '  Spaghetti  ', notes: '  lekker  ' }));
		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.data.name).toBe('Spaghetti');
			expect(result.data.notes).toBe('lekker');
		}
	});

	it('deduplicates exact-match ingredient names', () => {
		const result = validateMealForm(raw({ ingredientNames: ['tomaat', 'tomaat', 'kip'] }));
		expect(result.valid).toBe(true);
		if (result.valid) {
			expect(result.data.ingredientNames).toEqual(['tomaat', 'kip']);
		}
	});
});

describe('validateIngredientName', () => {
	it('accepts a non-empty name and trims it', () => {
		const result = validateIngredientName('  tomaat  ');
		expect(result.valid).toBe(true);
		if (result.valid) expect(result.data).toBe('tomaat');
	});

	it('rejects an empty name', () => {
		const result = validateIngredientName('');
		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.error).toBeDefined();
	});

	it('rejects a whitespace-only name', () => {
		const result = validateIngredientName('   ');
		expect(result.valid).toBe(false);
		if (!result.valid) expect(result.error).toBeDefined();
	});
});
