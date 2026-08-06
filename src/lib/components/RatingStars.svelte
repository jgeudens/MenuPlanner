<script lang="ts">
	let { rating }: { rating: number } = $props();
</script>

<div class="flex items-center gap-0.5" aria-label={`Beoordeling: ${rating} van 5 sterren`}>
	{#each Array(5) as _, i (i)}
		<svg
			viewBox="0 0 20 20"
			class="h-4 w-4 {i < rating ? 'text-primary-600' : 'text-gray-300'}"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8-4.21-4.1 5.82-.85z"
			/>
		</svg>
	{/each}
</div>
