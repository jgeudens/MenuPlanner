import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { SESSION_COOKIE_NAME, verifyPasscode, createSessionCookieValue } from '$lib/server/auth';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const passcode = String(data.get('passcode') ?? '').trim();

		if (!passcode || !verifyPasscode(passcode)) {
			return fail(400, { error: 'Onjuiste toegangscode.' });
		}

		cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: ONE_YEAR_IN_SECONDS
		});

		redirect(303, '/');
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
		redirect(303, '/login');
	}
};
