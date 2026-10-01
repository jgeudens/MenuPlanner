import { createHmac, timingSafeEqual } from 'node:crypto';
import { HOUSEHOLD_PASSCODE, READONLY_PASSCODE, SESSION_SECRET } from '$env/static/private';

export const SESSION_COOKIE_NAME = 'menuplanner_session';

export type Role = 'rw' | 'ro';

export function computeSessionDigest(passcode: string, secret: string): string {
	return createHmac('sha256', secret).update(passcode).digest('hex');
}

function timingSafeEqualStrings(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// An empty or identical read-only passcode would either open the app to anyone
// or make both roles share one cookie, so read-only is disabled in those cases.
const readOnlyEnabled = READONLY_PASSCODE !== '' && READONLY_PASSCODE !== HOUSEHOLD_PASSCODE;

/** Returns the role a passcode grants, or null when it matches neither. */
export function resolveRole(input: string): Role | null {
	const isReadWrite = timingSafeEqualStrings(input, HOUSEHOLD_PASSCODE);
	const isReadOnly = readOnlyEnabled && timingSafeEqualStrings(input, READONLY_PASSCODE);
	if (isReadWrite) return 'rw';
	if (isReadOnly) return 'ro';
	return null;
}

export function createSessionCookieValue(role: Role): string {
	return computeSessionDigest(
		role === 'rw' ? HOUSEHOLD_PASSCODE : READONLY_PASSCODE,
		SESSION_SECRET
	);
}

export function getSessionRole(value: string | undefined): Role | null {
	if (!value) return null;
	const isReadWrite = timingSafeEqualStrings(value, createSessionCookieValue('rw'));
	const isReadOnly =
		readOnlyEnabled && timingSafeEqualStrings(value, createSessionCookieValue('ro'));
	if (isReadWrite) return 'rw';
	if (isReadOnly) return 'ro';
	return null;
}
