<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let filter = $state('');

	const filtered = $derived(
		data.ingredients.filter((ing) => ing.name.toLowerCase().includes(filter.trim().toLowerCase()))
	);

	// A rename that collides with an existing ingredient merges the two — that
	// deletes an ingredient and is irreversible, so warn first (mirrors the
	// confirm() on meal deletion). Stored names are already lowercased.
	function confirmMerge(e: SubmitEvent) {
		const formEl = e.currentTarget as HTMLFormElement;
		const id = (formEl.elements.namedItem('id') as HTMLInputElement).value;
		const typed = (formEl.elements.namedItem('name') as HTMLInputElement).value
			.trim()
			.toLowerCase();
		const target = data.ingredients.find(
			(ing) => ing.id !== id && ing.name.toLowerCase() === typed
		);
		if (target && !confirm(`Dit ingrediënt wordt samengevoegd met "${target.name}". Doorgaan?`)) {
			e.preventDefault();
		}
	}
</script>

<svelte:head>
	<title>Ingrediënten beheren - MenuPlanner</title>
</svelte:head>

<h1 class="mb-2 text-xl font-semibold text-gray-900">Ingrediënten beheren</h1>
<p class="mb-6 text-sm text-gray-600">
	Corrigeer de naam van een ingrediënt. Kies je een naam die al bestaat, dan worden de ingrediënten
	samengevoegd.
</p>

{#if data.ingredients.length === 0}
	<p class="text-gray-600">Er zijn nog geen ingrediënten.</p>
{:else}
	<input
		type="search"
		placeholder="Filter ingrediënten…"
		aria-label="Filter ingrediënten"
		bind:value={filter}
		class="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
	/>

	<ul class="divide-y divide-gray-200">
		{#each filtered as ingredient (ingredient.id)}
			<li class="py-3">
				<form
					method="POST"
					action="?/rename"
					onsubmit={confirmMerge}
					class="flex items-center gap-3"
				>
					<input type="hidden" name="id" value={ingredient.id} />
					<input
						name="name"
						value={ingredient.name}
						required
						aria-label={`Naam voor ${ingredient.name}`}
						class="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
					/>
					<span class="shrink-0 text-sm text-gray-500">
						{ingredient.mealCount}
						{ingredient.mealCount === 1 ? 'gerecht' : 'gerechten'}
					</span>
					<button
						type="submit"
						class="shrink-0 rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						Opslaan
					</button>
				</form>
				{#if form?.errorId === ingredient.id && form?.error}
					<p class="mt-1 text-sm text-red-600">{form.error}</p>
				{/if}
			</li>
		{/each}
	</ul>

	{#if filtered.length === 0}
		<p class="py-3 text-gray-600">Geen ingrediënten gevonden.</p>
	{/if}
{/if}
