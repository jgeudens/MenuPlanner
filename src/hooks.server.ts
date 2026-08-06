import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, isValidSessionCookie } from '$lib/server/auth';

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

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (isPublicAsset(pathname)) {
		return resolve(event);
	}

	const authenticated = isValidSessionCookie(event.cookies.get(SESSION_COOKIE_NAME));

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

	return resolve(event);
};
