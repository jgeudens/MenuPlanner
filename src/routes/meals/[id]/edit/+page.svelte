<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import FormField from '$lib/components/FormField.svelte';
	import IngredientPicker from '$lib/components/IngredientPicker.svelte';
	import MealNameInput from '$lib/components/MealNameInput.svelte';
	import RatingInput from '$lib/components/RatingInput.svelte';

	let { data, form }: PageProps = $props();

	let name = $state(untrack(() => form?.values?.name ?? data.meal.name));
	let rating = $state(untrack(() => Number(form?.values?.rating) || data.meal.rating));
	let selectedIngredients = $state(
		untrack(() =>
			form?.values?.ingredientNames
				? form.values.ingredientNames.map((name: string) => ({ id: null, name }))
				: data.meal.ingredients.map((i) => ({ id: i.id, name: i.name }))
		)
	);

	function confirmDelete(e: SubmitEvent) {
		if (!confirm('Weet je zeker dat je dit gerecht wilt verwijderen?')) {
			e.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>{data.meal.name} bewerken - MenuPlanner</title>
</svelte:head>

<h1 class="mb-6 text-xl font-semibold text-gray-900">Gerecht bewerken</h1>

<form method="POST" action="?/update" class="space-y-5">
	<FormField label="Naam" id="name" error={form?.errors?.name}>
		<MealNameInput id="name" name="name" required bind:value={name} />
	</FormField>

	<FormField label="Datum" id="date" error={form?.errors?.date}>
		<input
			id="date"
			name="date"
			type="date"
			required
			value={form?.values?.date ?? data.meal.date}
			class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
		/>
	</FormField>

	<FormField label="Ingrediënten" id="ingredients" error={form?.errors?.ingredientNames}>
		<IngredientPicker bind:selected={selectedIngredients} mode="create" />
	</FormField>

	<FormField label="Beoordeling" id="rating" error={form?.errors?.rating}>
		<RatingInput bind:value={rating} />
	</FormField>

	<FormField label="Notities (optioneel)" id="notes">
		<textarea
			id="notes"
			name="notes"
			rows="3"
			value={form?.values?.notes ?? data.meal.notes ?? ''}
			class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
		></textarea>
	</FormField>

	<div class="flex gap-3">
		<button
			type="submit"
			class="rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			Opslaan
		</button>
		<a href={resolve('/')} class="rounded-md px-4 py-2 font-medium text-gray-600 hover:bg-gray-100">
			Annuleren
		</a>
	</div>
</form>

<form
	method="POST"
	action="?/delete"
	onsubmit={confirmDelete}
	class="mt-6 border-t border-gray-200 pt-6"
>
	<button
		type="submit"
		class="rounded text-sm font-medium text-red-600 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none"
	>
		Gerecht verwijderen
	</button>
</form>
