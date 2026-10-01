<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';

	const allLinks = [
		{ href: '/', label: 'Overzicht', writes: false },
		{ href: '/meals/new', label: 'Nieuw gerecht', writes: true },
		{ href: '/search', label: 'Zoeken', writes: false },
		{ href: '/stats', label: 'Statistieken', writes: false }
	] as const;

	const readOnly = $derived(page.data.readOnly === true);
	const links = $derived(allLinks.filter((link) => !(readOnly && link.writes)));

	let open = $state(false);

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	// Close the mobile menu after any navigation (e.g. tapping a link).
	afterNavigate(() => {
		open = false;
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header class="bg-primary-700 text-white">
	<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
		<a href={resolve('/')} class="text-lg font-semibold tracking-tight">MenuPlanner</a>

		<!-- Desktop navigation (md and up) -->
		<nav class="hidden items-center gap-1 md:flex">
			{#each links as link (link.href)}
				<a
					href={resolve(link.href)}
					class="rounded-md px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none {isActive(
						link.href
					)
						? 'bg-primary-800 text-white'
						: 'text-primary-100 hover:bg-primary-600 hover:text-white'}"
				>
					{link.label}
				</a>
			{/each}
			{#if readOnly}
				<span class="ml-2 rounded-full bg-primary-800 px-2.5 py-0.5 text-xs font-medium">
					Alleen lezen
				</span>
			{:else}
				<span class="mx-1 h-5 w-px bg-primary-600" aria-hidden="true"></span>
				<a
					href={resolve('/admin')}
					class="rounded-md px-3 py-1.5 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none {isActive(
						'/admin'
					)
						? 'bg-primary-800 text-white'
						: 'text-primary-100 hover:bg-primary-600 hover:text-white'}"
				>
					Beheer
				</a>
			{/if}
		</nav>

		<!-- Mobile hamburger toggle (below md) -->
		<button
			type="button"
			onclick={() => (open = !open)}
			aria-expanded={open}
			aria-controls="mobile-nav"
			aria-label={open ? 'Menu sluiten' : 'Menu openen'}
			class="rounded-md p-2 text-primary-100 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none md:hidden"
		>
			{#if open}
				<svg
					class="h-6 w-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M6 6 18 18M6 18 18 6" />
				</svg>
			{:else}
				<svg
					class="h-6 w-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			{/if}
		</button>
	</div>

	<!-- Mobile menu panel (below md) -->
	{#if open}
		<nav id="mobile-nav" class="mx-auto max-w-3xl px-4 pb-3 md:hidden">
			<div class="flex flex-col gap-1">
				{#each links as link (link.href)}
					<a
						href={resolve(link.href)}
						class="rounded-md px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none {isActive(
							link.href
						)
							? 'bg-primary-800 text-white'
							: 'text-primary-100 hover:bg-primary-600 hover:text-white'}"
					>
						{link.label}
					</a>
				{/each}
				{#if readOnly}
					<span class="px-3 py-2 text-xs font-medium text-primary-100">Alleen lezen</span>
				{:else}
					<span class="my-1 h-px w-full bg-primary-600" aria-hidden="true"></span>
					<a
						href={resolve('/admin')}
						class="rounded-md px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none {isActive(
							'/admin'
						)
							? 'bg-primary-800 text-white'
							: 'text-primary-100 hover:bg-primary-600 hover:text-white'}"
					>
						Beheer
					</a>
				{/if}
			</div>
		</nav>
	{/if}
</header>
