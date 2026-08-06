<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		id,
		error,
		children
	}: { label: string; id: string; error?: string; children: Snippet } = $props();
</script>

<div>
	<label for={id} class="mb-1 block text-sm font-medium text-gray-700">{label}</label>
	{@render children()}
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
