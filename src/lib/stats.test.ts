import { describe, expect, it } from 'vitest';
import {
	computeAverageRating,
	computeMostRepeated,
	computeMostUsedIngredients,
	computeTopRated,
	computeTotalMeals
} from './stats';
import type { MealStatsSource } from './types';

function meal(overrides: Partial<MealStatsSource> = {}): MealStatsSource {
	return {
		id: crypto.randomUUID(),
		name: 'Gerecht',
		date: '2026-01-01',
		rating: 3,
		ingredients: [],
		...overrides
	};
}

describe('computeTotalMeals', () => {
	it('returns 0 for an empty list', () => {
		expect(computeTotalMeals([])).toBe(0);
	});

	it('returns the number of meals', () => {
		expect(computeTotalMeals([meal(), meal(), meal()])).toBe(3);
	});
});

describe('computeAverageRating', () => {
	it('returns null for an empty list (not 0 or NaN)', () => {
		expect(computeAverageRating([])).toBeNull();
	});

	it('computes the mean rating', () => {
		const meals = [meal({ rating: 5 }), meal({ rating: 3 }), meal({ rating: 4 })];
		expect(computeAverageRating(meals)).toBeCloseTo(4);
	});
});

describe('computeTopRated', () => {
	it('sorts by rating descending, ties broken by date descending', () => {
		const meals = [
			meal({ id: 'a', rating: 3, date: '2026-01-01' }),
			meal({ id: 'b', rating: 5, date: '2026-01-02' }),
			meal({ id: 'c', rating: 5, date: '2026-01-05' }),
			meal({ id: 'd', rating: 4, date: '2026-01-03' })
		];

		const result = computeTopRated(meals);

		expect(result.map((m) => m.id)).toEqual(['c', 'b', 'd', 'a']);
	});

	it('respects the limit', () => {
		const meals = [meal(), meal(), meal(), meal()];
		expect(computeTopRated(meals, 2)).toHaveLength(2);
	});
});

describe('computeMostRepeated', () => {
	it('groups by name case-insensitively and counts occurrences', () => {
		// Same date on both -> the first-seen casing is kept as the display name.
		const meals = [
			meal({ name: 'Spaghetti' }),
			meal({ name: 'spaghetti' }),
			meal({ name: 'Tacos' })
		];

		const result = computeMostRepeated(meals);

		expect(result[0]).toEqual({ name: 'Spaghetti', count: 2 });
		expect(result[1]).toEqual({ name: 'Tacos', count: 1 });
	});

	it('sorts by count descending and respects the limit', () => {
		const meals = [
			meal({ name: 'A' }),
			meal({ name: 'B' }),
			meal({ name: 'B' }),
			meal({ name: 'C' }),
			meal({ name: 'C' }),
			meal({ name: 'C' })
		];

		const result = computeMostRepeated(meals, 2);

		expect(result).toEqual([
			{ name: 'C', count: 3 },
			{ name: 'B', count: 2 }
		]);
	});
});

describe('computeMostUsedIngredients', () => {
	it('counts ingredient occurrences across meals, case-insensitively', () => {
		// tomaat and kip tie at count 2 -> alphabetical tie-break puts kip first.
		const meals = [
			meal({ ingredients: [{ name: 'tomaat' }, { name: 'kip' }] }),
			meal({ ingredients: [{ name: 'Tomaat' }] }),
			meal({ ingredients: [{ name: 'kip' }, { name: 'ui' }] })
		];

		const result = computeMostUsedIngredients(meals);

		expect(result).toEqual([
			{ name: 'kip', count: 2 },
			{ name: 'tomaat', count: 2 },
			{ name: 'ui', count: 1 }
		]);
	});

	it('handles a meal with a duplicate ingredient list', () => {
		const meals = [meal({ ingredients: [{ name: 'tomaat' }, { name: 'tomaat' }] })];

		expect(computeMostUsedIngredients(meals)).toEqual([{ name: 'tomaat', count: 2 }]);
	});

	it('respects the limit', () => {
		const meals = [meal({ ingredients: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] })];

		expect(computeMostUsedIngredients(meals, 2)).toHaveLength(2);
	});
});
