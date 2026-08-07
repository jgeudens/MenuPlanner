<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';
	import FormField from '$lib/components/FormField.svelte';
	import IngredientPicker from '$lib/components/IngredientPicker.svelte';
	import RatingInput from '$lib/components/RatingInput.svelte';
	import { todayIso } from '$lib/utils';

	let { form }: { form: ActionData } = $props();

	let rating = $state(0);
	// Only ever read once: this component remounts on every full-page form
	// submission (no use:enhance), so the initial value is always current.
	let selectedIngredients = $state(
		untrack(() => (form?.values?.ingredientNames ?? []).map((name: string) => ({ id: null, name })))
	);
</script>

<svelte:head>
	<title>Nieuw gerecht — MenuPlanner</title>
</svelte:head>

<h1 class="mb-6 text-xl font-semibold text-gray-900">Nieuw gerecht loggen</h1>

<form method="POST" class="space-y-5">
	<FormField label="Naam" id="name" error={form?.errors?.name}>
		<input
			id="name"
			name="name"
			type="text"
			required
			value={form?.values?.name ?? ''}
			class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
		/>
	</FormField>

	<FormField label="Datum" id="date" error={form?.errors?.date}>
		<input
			id="date"
			name="date"
			type="date"
			required
			value={form?.values?.date ?? todayIso()}
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
			value={form?.values?.notes ?? ''}
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
