<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { MealSuggestion } from '$lib/types';

	let {
		value = $bindable(''),
		id,
		name = 'name',
		required = false,
		onSelect
	}: {
		value?: string;
		id?: string;
		name?: string;
		required?: boolean;
		onSelect?: (suggestion: MealSuggestion) => void;
	} = $props();

	let suggestions = $state<MealSuggestion[]>([]);
	let open = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let blurTimer: ReturnType<typeof setTimeout> | undefined;

	async function fetchSuggestions(q: string) {
		if (!q.trim()) {
			suggestions = [];
			return;
		}
		const res = await fetch(`/api/meals/suggestions?q=${encodeURIComponent(q.trim())}`);
		suggestions = res.ok ? await res.json() : [];
	}

	function onFocus() {
		clearTimeout(blurTimer);
		open = true;
	}

	function onBlur() {
		// Delayed so a click on a suggestion button registers first. Cleared
		// by onFocus/onInput so it can never close a dropdown reopened by a
		// later interaction (it would otherwise fire on its own schedule
		// regardless of what happened in between).
		blurTimer = setTimeout(() => {
			open = false;
		}, 150);
	}

	function onInput() {
		clearTimeout(blurTimer);
		open = true;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => fetchSuggestions(value), 200);
	}

	function select(suggestion: MealSuggestion) {
		clearTimeout(blurTimer);
		value = suggestion.name;
		suggestions = [];
		open = false;
		onSelect?.(suggestion);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	onDestroy(() => {
		clearTimeout(debounceTimer);
		clearTimeout(blurTimer);
	});
</script>

<div class="relative">
	<input
		{id}
		{name}
		type="text"
		autocomplete="off"
		{required}
		bind:value
		oninput={onInput}
		onkeydown={onKeydown}
		onfocus={onFocus}
		onblur={onBlur}
		class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
	/>

	{#if open && suggestions.length > 0}
		<ul class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg">
			{#each suggestions as suggestion (suggestion.name)}
				<li>
					<button
						type="button"
						onclick={() => select(suggestion)}
						class="block w-full px-3 py-1.5 text-left text-sm hover:bg-primary-50"
					>
						{suggestion.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
