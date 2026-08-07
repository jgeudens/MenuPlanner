<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const links = [
		{ href: '/', label: 'Overzicht' },
		{ href: '/meals/new', label: 'Nieuw gerecht' },
		{ href: '/search', label: 'Zoeken' },
		{ href: '/stats', label: 'Statistieken' }
	] as const;

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<header class="bg-primary-700 text-white">
	<div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
		<a href={resolve('/')} class="text-lg font-semibold tracking-tight">MenuPlanner</a>
		<nav class="flex items-center gap-1">
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
			<form method="POST" action="/login?/logout">
				<button
					type="submit"
					class="rounded-md px-3 py-1.5 text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 focus-visible:outline-none"
				>
					Uitloggen
				</button>
			</form>
		</nav>
	</div>
</header>
