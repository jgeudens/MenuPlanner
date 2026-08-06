<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Inloggen — Pantry Log</title>
</svelte:head>

<div class="mx-auto mt-16 max-w-sm">
	<h1 class="mb-6 text-center text-2xl font-semibold text-gray-900">Pantry Log</h1>
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
				class="w-full rounded-md border border-gray-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
			/>
		</div>
		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}
		<button
			type="submit"
			class="w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
		>
			Inloggen
		</button>
	</form>
</div>
