<script lang="ts">
	import { onDestroy } from 'svelte';

	type Selected = { id: string | null; name: string };
	type Suggestion = { id: string; name: string };

	let {
		selected = $bindable([] as Selected[]),
		mode = 'create',
		name = 'ingredientNames',
		placeholder = 'Ingrediënt toevoegen…'
	}: {
		selected?: Selected[];
		mode?: 'create' | 'select';
		name?: string;
		placeholder?: string;
	} = $props();

	let query = $state('');
	let suggestions = $state<Suggestion[]>([]);
	let open = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function isAlreadySelected(candidateName: string) {
		return selected.some((s) => s.name.toLowerCase() === candidateName.trim().toLowerCase());
	}

	async function fetchSuggestions(q: string) {
		if (!q.trim()) {
			suggestions = [];
			return;
		}
		const res = await fetch(`/api/ingredients?q=${encodeURIComponent(q.trim())}`);
		suggestions = res.ok ? await res.json() : [];
	}

	function onInput() {
		open = true;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => fetchSuggestions(query), 200);
	}

	function addSelection(item: Selected) {
		if (!isAlreadySelected(item.name)) {
			selected = [...selected, item];
		}
		query = '';
		suggestions = [];
		open = false;
	}

	function addNew() {
		const trimmed = query.trim();
		if (!trimmed) return;
		addSelection({ id: null, name: trimmed });
	}

	function remove(item: Selected) {
		selected = selected.filter((s) => s !== item);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (suggestions.length > 0) {
				addSelection(suggestions[0]);
			} else if (mode === 'create') {
				addNew();
			}
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	const exactMatch = $derived(
		suggestions.some((s) => s.name.toLowerCase() === query.trim().toLowerCase())
	);

	onDestroy(() => clearTimeout(debounceTimer));
</script>

<div class="relative">
	{#each selected as item (item.id ?? item.name)}
		<input type="hidden" {name} value={mode === 'select' ? item.id : item.name} />
	{/each}

	<div class="mb-2 flex flex-wrap gap-1.5">
		{#each selected as item (item.id ?? item.name)}
			<span
				class="inline-flex items-center gap-1 rounded-full border border-primary-300 bg-primary-100 px-2.5 py-1 text-sm text-primary-800"
			>
				{item.name}
				<button
					type="button"
					onclick={() => remove(item)}
					class="rounded-full text-primary-600 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
					aria-label={`${item.name} verwijderen`}
				>
					&times;
				</button>
			</span>
		{/each}
	</div>

	<input
		type="text"
		bind:value={query}
		oninput={onInput}
		onkeydown={onKeydown}
		onfocus={() => (open = true)}
		onblur={() => setTimeout(() => (open = false), 150)}
		{placeholder}
		class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
	/>

	{#if open && query.trim() && (suggestions.length > 0 || mode === 'create')}
		<ul class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
			{#each suggestions as suggestion (suggestion.id)}
				<li>
					<button
						type="button"
						onclick={() => addSelection(suggestion)}
						class="block w-full px-3 py-1.5 text-left text-sm hover:bg-primary-50"
					>
						{suggestion.name}
					</button>
				</li>
			{/each}
			{#if mode === 'create' && !exactMatch}
				<li>
					<button
						type="button"
						onclick={addNew}
						class="block w-full px-3 py-1.5 text-left text-sm text-primary-700 hover:bg-primary-50"
					>
						Nieuw: "{query.trim()}" toevoegen
					</button>
				</li>
			{/if}
		</ul>
	{/if}
</div>
