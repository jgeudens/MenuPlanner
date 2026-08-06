<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'Overzicht' },
		{ href: '/meals/new', label: 'Nieuw gerecht' },
		{ href: '/search', label: 'Zoeken' },
		{ href: '/stats', label: 'Statistieken' }
	];

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<header class="bg-primary-700 text-white">
	<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
		<a href="/" class="text-lg font-semibold tracking-tight">Pantry Log</a>
		<nav class="flex items-center gap-1">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 {isActive(
						link.href
					)
						? 'bg-primary-800 text-white'
						: 'text-primary-100 hover:bg-primary-600 hover:text-white'}"
				>
					{link.label}
				</a>
			{/each}
			<form method="POST" action="/login?/logout">
				<button
					type="submit"
					class="rounded-md px-3 py-1.5 text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
				>
					Uitloggen
				</button>
			</form>
		</nav>
	</div>
</header>
