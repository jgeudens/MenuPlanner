import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { SESSION_COOKIE_NAME, verifyPasscode, createSessionCookieValue } from '$lib/server/auth';
import {
	checkLoginRateLimit,
	recordLoginFailure,
	recordLoginSuccess
} from '$lib/server/rate-limit';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const actions: Actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();

		if (!checkLoginRateLimit(ip).allowed) {
			return fail(429, {
				error: 'Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.'
			});
		}

		const data = await request.formData();
		const passcode = String(data.get('passcode') ?? '').trim();

		if (!passcode || !verifyPasscode(passcode)) {
			recordLoginFailure(ip);
			return fail(400, { error: 'Onjuiste toegangscode.' });
		}

		recordLoginSuccess(ip);

		cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: ONE_YEAR_IN_SECONDS
		});

		redirect(303, '/');
	}
};
