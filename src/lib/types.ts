export type Ingredient = {
	id: string;
	name: string;
};

export type Meal = {
	id: string;
	name: string;
	/** ISO date string, YYYY-MM-DD */
	date: string;
	rating: number;
	notes: string | null;
};

export type MealWithIngredients = Meal & {
	ingredients: Ingredient[];
};

export type MealFormInput = {
	name: string;
	date: string;
	rating: number;
	notes: string;
	ingredientNames: string[];
};

export type MealSuggestion = Pick<MealWithIngredients, 'name' | 'rating' | 'notes' | 'ingredients'>;

export type MealStatsSource = {
	id: string;
	name: string;
	date: string;
	rating: number;
	ingredients: { name: string }[];
};
