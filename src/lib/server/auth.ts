import { createHmac, timingSafeEqual } from 'node:crypto';
import { HOUSEHOLD_PASSCODE, SESSION_SECRET } from '$env/static/private';

export const SESSION_COOKIE_NAME = 'menuplanner_session';

export function computeSessionDigest(passcode: string, secret: string): string {
	return createHmac('sha256', secret).update(passcode).digest('hex');
}

function timingSafeEqualStrings(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function verifyPasscode(input: string): boolean {
	return timingSafeEqualStrings(input, HOUSEHOLD_PASSCODE);
}

export function createSessionCookieValue(): string {
	return computeSessionDigest(HOUSEHOLD_PASSCODE, SESSION_SECRET);
}

export function isValidSessionCookie(value: string | undefined): boolean {
	if (!value) return false;
	return timingSafeEqualStrings(value, createSessionCookieValue());
}
