import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/supabase';
import { SESSION_COOKIE_NAME, getSessionRole } from '$lib/server/auth';

const PUBLIC_PATH_PREFIXES = [
	'/_app/',
	'/manifest.webmanifest',
	'/sw.js',
	'/registerSW.js',
	'/workbox-',
	'/favicon.svg',
	'/robots.txt',
	'/pwa-'
];

function isPublicAsset(pathname: string): boolean {
	return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const WRITE_ROUTE_PATTERNS = [/^\/meals\/new\/?$/, /^\/meals\/[^/]+\/edit\/?$/, /^\/admin\/?$/];

function isWriteRoute(pathname: string): boolean {
	return WRITE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (isPublicAsset(pathname)) {
		return resolve(event);
	}

	const role = getSessionRole(event.cookies.get(SESSION_COOKIE_NAME));
	const authenticated = role !== null;
	event.locals.readOnly = role === 'ro';
	event.locals.db = getDb(event.locals.readOnly);

	if (pathname === '/login') {
		if (authenticated) redirect(303, '/');
		return resolve(event);
	}

	if (!authenticated) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Niet ingelogd.' }), {
				status: 401,
				headers: { 'content-type': 'application/json' }
			});
		}
		redirect(303, '/login');
	}

	if (event.locals.readOnly) {
		if (!['GET', 'HEAD'].includes(event.request.method)) {
			return new Response('Alleen lezen.', { status: 403 });
		}
		if (isWriteRoute(pathname)) redirect(303, '/');
	}

	return resolve(event);
};
