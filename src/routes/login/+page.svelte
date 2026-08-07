<script lang="ts">
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let contactCanvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = contactCanvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = 130;
		const height = 16;
		contactCanvas.width = width * dpr;
		contactCanvas.height = height * dpr;
		contactCanvas.style.width = `${width}px`;
		contactCanvas.style.height = `${height}px`;
		ctx.scale(dpr, dpr);
		ctx.font = '600 12px system-ui, sans-serif';
		ctx.fillStyle = '#6b7280';
		ctx.textBaseline = 'middle';
		// Rendered on canvas, not present in the DOM, to keep this out of scrapers' reach.
		ctx.fillText('info@synvis.net', 0, height / 2 + 1);
	});
</script>

<svelte:head>
	<title>Inloggen - MenuPlanner</title>
</svelte:head>

<div class="mx-auto mt-16 max-w-sm">
	<h1 class="mb-2 text-center text-2xl font-semibold text-gray-900">MenuPlanner</h1>
	<p class="mb-6 text-center text-sm text-gray-500">
		A private log of dishes you've actually cooked, not a recipe manager and not a nutrition
		tracker. Log what you made, look back through your history, and search by ingredient when you're
		not sure what to cook tonight. No clutter, just some people sharing a kitchen and one shared
		passcode to get in.
	</p>
	<form
		method="POST"
		action="?/login"
		class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
	>
		<div>
			<label for="passcode" class="mb-1 block text-sm font-medium text-gray-700">
				Toegangscode
			</label>
			<input
				id="passcode"
				name="passcode"
				type="password"
				autocomplete="current-password"
				required
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
			/>
		</div>
		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}
		<button
			type="submit"
			class="w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			Inloggen
		</button>
	</form>
	<p class="mt-8 flex flex-col items-center gap-1 text-center text-xs text-gray-400">
		<span>If you're interested, you can contact me at</span>
		<canvas bind:this={contactCanvas} aria-hidden="true"></canvas>
	</p>
</div>
