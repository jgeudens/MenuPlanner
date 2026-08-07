<script lang="ts">
	import type { PageProps } from './$types';
	import { formatDateNl } from '$lib/utils';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Statistieken - MenuPlanner</title>
</svelte:head>

<h1 class="mb-6 text-xl font-semibold text-gray-900">Statistieken</h1>

{#if data.totalMeals === 0}
	<p class="text-gray-600">Nog geen gegevens. Log eerst een paar gerechten.</p>
{:else}
	<div class="mb-6 grid grid-cols-2 gap-4">
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<p class="text-2xl font-semibold text-primary-700">{data.totalMeals}</p>
			<p class="text-sm text-gray-500">gerechten gelogd</p>
		</div>
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<p class="text-2xl font-semibold text-primary-700">
				{data.averageRating?.toFixed(1) ?? '–'}
			</p>
			<p class="text-sm text-gray-500">gemiddelde beoordeling</p>
		</div>
	</div>

	<div class="space-y-6">
		<section>
			<h2 class="mb-2 font-semibold text-gray-900">Best beoordeeld</h2>
			<ol class="space-y-1">
				{#each data.topRated as meal (meal.id)}
					<li class="flex justify-between rounded-md bg-white px-3 py-2 text-sm">
						<span>{meal.name}</span>
						<span class="text-gray-500">{meal.rating}/5 · {formatDateNl(meal.date)}</span>
					</li>
				{/each}
			</ol>
		</section>

		<section>
			<h2 class="mb-2 font-semibold text-gray-900">Vaakst gemaakt</h2>
			<ol class="space-y-1">
				{#each data.mostRepeated as item (item.name)}
					<li class="flex justify-between rounded-md bg-white px-3 py-2 text-sm">
						<span>{item.name}</span>
						<span class="text-gray-500">{item.count}×</span>
					</li>
				{/each}
			</ol>
		</section>

		<section>
			<h2 class="mb-2 font-semibold text-gray-900">Meest gebruikte ingrediënten</h2>
			<ol class="space-y-1">
				{#each data.mostUsedIngredients as item (item.name)}
					<li class="flex justify-between rounded-md bg-white px-3 py-2 text-sm">
						<span>{item.name}</span>
						<span class="text-gray-500">{item.count}×</span>
					</li>
				{/each}
			</ol>
		</section>
	</div>
{/if}
