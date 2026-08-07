<script lang="ts">
	import { untrack } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import type { PageProps } from './$types';
	import IngredientPicker from '$lib/components/IngredientPicker.svelte';
	import MealCard from '$lib/components/MealCard.svelte';

	let { data }: PageProps = $props();

	let selected = $state(
		untrack(() => data.selectedIngredients.map((i) => ({ id: i.id, name: i.name })))
	);

	// Search is a GET form, so SvelteKit navigates client-side without
	// remounting this component — resync the picker from the URL/data on
	// every navigation (search submit, back/forward) so it never drifts.
	afterNavigate(() => {
		selected = data.selectedIngredients.map((i) => ({ id: i.id, name: i.name }));
	});
</script>

<svelte:head>
	<title>Zoeken — MenuPlanner</title>
</svelte:head>

<h1 class="mb-6 text-xl font-semibold text-gray-900">Zoeken op ingrediënt</h1>

<form method="GET" class="mb-6 flex items-start gap-3">
	<div class="flex-1">
		<IngredientPicker
			bind:selected
			mode="select"
			name="ingredient"
			placeholder="Ingrediënt zoeken…"
		/>
	</div>
	<button
		type="submit"
		class="rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		Zoeken
	</button>
</form>

{#if !data.hasSearched}
	<p class="text-gray-600">Kies één of meer ingrediënten om te zoeken in je logboek.</p>
{:else if data.meals.length === 0}
	<p class="text-gray-600">Geen gerechten gevonden met deze ingrediënten.</p>
{:else}
	<div class="space-y-3">
		{#each data.meals as meal (meal.id)}
			<MealCard {meal} />
		{/each}
	</div>
{/if}
