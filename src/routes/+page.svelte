<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import MealCard from '$lib/components/MealCard.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Overzicht — Pantry Log</title>
</svelte:head>

<h1 class="sr-only">Overzicht</h1>

{#if data.meals.length === 0}
	<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
		<p class="text-gray-600">Nog geen gerechten gelogd.</p>
		<a
			href={resolve('/meals/new')}
			class="mt-3 inline-block font-medium text-primary-600 underline-offset-2 hover:text-primary-700 hover:underline"
		>
			Log je eerste gerecht
		</a>
	</div>
{:else}
	<div class="space-y-3">
		{#each data.meals as meal (meal.id)}
			<MealCard {meal} />
		{/each}
	</div>

	{#if data.page > 1 || data.hasMore}
		<div class="mt-6 flex justify-between">
			{#if data.page > 1}
				<a
					href={resolve(`/?page=${data.page - 1}`)}
					class="text-sm font-medium text-primary-600 hover:text-primary-700"
				>
					← Vorige
				</a>
			{:else}
				<span></span>
			{/if}
			{#if data.hasMore}
				<a
					href={resolve(`/?page=${data.page + 1}`)}
					class="text-sm font-medium text-primary-600 hover:text-primary-700"
				>
					Volgende →
				</a>
			{/if}
		</div>
	{/if}
{/if}
