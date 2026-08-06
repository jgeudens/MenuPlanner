<script lang="ts">
	import RatingStars from './RatingStars.svelte';
	import { formatDateNl } from '$lib/utils';
	import type { MealWithIngredients } from '$lib/types';

	let { meal }: { meal: MealWithIngredients } = $props();
</script>

<a
	href={`/meals/${meal.id}/edit`}
	class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
>
	<div class="flex items-start justify-between gap-3">
		<div>
			<h3 class="font-semibold text-gray-900">{meal.name}</h3>
			<p class="text-sm text-gray-500">{formatDateNl(meal.date)}</p>
		</div>
		<RatingStars rating={meal.rating} />
	</div>
	{#if meal.ingredients.length > 0}
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#each meal.ingredients as ingredient (ingredient.id)}
				<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
					{ingredient.name}
				</span>
			{/each}
		</div>
	{/if}
</a>
