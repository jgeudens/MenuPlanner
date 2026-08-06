import type { MealStatsSource } from './types';

export type MealSummary = { id: string; name: string; date: string; rating: number };
export type NameCount = { name: string; count: number };

export function computeTotalMeals(meals: MealStatsSource[]): number {
	return meals.length;
}

export function computeAverageRating(meals: MealStatsSource[]): number | null {
	if (meals.length === 0) return null;
	const sum = meals.reduce((acc, m) => acc + m.rating, 0);
	return sum / meals.length;
}

export function computeTopRated(meals: MealStatsSource[], limit = 10): MealSummary[] {
	return [...meals]
		.sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date))
		.slice(0, limit)
		.map(({ id, name, date, rating }) => ({ id, name, date, rating }));
}

export function computeMostRepeated(meals: MealStatsSource[], limit = 10): NameCount[] {
	const groups = new Map<string, { name: string; count: number; latestDate: string }>();

	for (const meal of meals) {
		const key = meal.name.trim().toLowerCase();
		const existing = groups.get(key);
		if (existing) {
			existing.count += 1;
			if (meal.date > existing.latestDate) {
				existing.latestDate = meal.date;
				existing.name = meal.name.trim();
			}
		} else {
			groups.set(key, { name: meal.name.trim(), count: 1, latestDate: meal.date });
		}
	}

	return [...groups.values()]
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'nl'))
		.slice(0, limit)
		.map(({ name, count }) => ({ name, count }));
}

export function computeMostUsedIngredients(meals: MealStatsSource[], limit = 10): NameCount[] {
	const counts = new Map<string, { name: string; count: number }>();

	for (const meal of meals) {
		for (const ingredient of meal.ingredients) {
			const key = ingredient.name.trim().toLowerCase();
			const existing = counts.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				counts.set(key, { name: ingredient.name.trim(), count: 1 });
			}
		}
	}

	return [...counts.values()]
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'nl'))
		.slice(0, limit);
}
