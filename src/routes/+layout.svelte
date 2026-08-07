<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { toast, showToast } from '$lib/stores';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();

	const toastMessages: Record<string, { message: string; kind: 'success' | 'error' }> = {
		'meal-saved': { message: 'Gerecht opgeslagen.', kind: 'success' },
		'meal-updated': { message: 'Gerecht bijgewerkt.', kind: 'success' },
		'meal-deleted': { message: 'Gerecht verwijderd.', kind: 'success' },
		'ingredient-renamed': { message: 'Ingrediënt bijgewerkt.', kind: 'success' },
		'ingredient-merged': { message: 'Ingrediënten samengevoegd.', kind: 'success' }
	};

	// afterNavigate (rather than a top-level $effect) waits until the router
	// has finished initializing, which replaceState requires — calling it
	// from $effect races router init on the very first page load. When the
	// page itself lands directly on a ?toast=… URL (e.g. after a form action
	// redirect), afterNavigate can still fire a tick before the router marks
	// itself started, so the replaceState call is deferred one more tick.
	afterNavigate(() => {
		const code = page.url.searchParams.get('toast');
		if (code && toastMessages[code]) {
			showToast(toastMessages[code].message, toastMessages[code].kind);
			setTimeout(() => {
				const url = new URL(page.url);
				url.searchParams.delete('toast');
				// This reconstructs the current (already-resolved) URL after
				// stripping one query param — it's not a navigation to a new
				// route, so resolve() doesn't apply here.
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				replaceState(url, {});
			});
		}
	});

	$effect(() => {
		if ($toast) {
			const timer = setTimeout(() => toast.set(null), 3000);
			return () => clearTimeout(timer);
		}
	});

	const isLoginPage = $derived(page.url.pathname === '/login');
</script>

<div class="flex min-h-screen flex-col bg-gray-50 text-gray-900">
	{#if !isLoginPage}
		<Nav />
	{/if}

	{#if $toast}
		<div
			class="fixed inset-x-0 top-20 z-50 flex justify-center px-4"
			role="status"
			aria-live="polite"
		>
			<div
				class="rounded-md px-4 py-2 text-sm font-medium shadow-lg {$toast.kind === 'success'
					? 'bg-primary-600 text-white'
					: 'bg-red-600 text-white'}"
			>
				{$toast.message}
			</div>
		</div>
	{/if}

	<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
		{@render children()}
	</main>
</div>
