<script lang="ts">
	let { value = $bindable(0), name = 'rating' }: { value?: number; name?: string } = $props();

	function setRating(n: number) {
		value = n;
	}
</script>

<div class="flex items-center gap-1" aria-label="Beoordeling">
	<input type="hidden" {name} value={value || ''} />
	{#each Array(5) as _, i (i)}
		{@const n = i + 1}
		<button
			type="button"
			aria-pressed={value === n}
			aria-label={`${n} van 5 sterren`}
			onclick={() => setRating(n)}
			class="rounded p-0.5 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:outline-none"
		>
			<svg
				viewBox="0 0 20 20"
				class="h-7 w-7 {n <= value ? 'text-primary-600' : 'text-gray-300 hover:text-primary-300'}"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8-4.21-4.1 5.82-.85z"
				/>
			</svg>
		</button>
	{/each}
</div>
