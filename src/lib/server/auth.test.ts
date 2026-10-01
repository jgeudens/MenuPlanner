import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/private', () => ({
	HOUSEHOLD_PASSCODE: 'rw-code',
	READONLY_PASSCODE: 'ro-code',
	SESSION_SECRET: 'secret-key'
}));

const { computeSessionDigest, resolveRole, createSessionCookieValue, getSessionRole } =
	await import('./auth');

describe('computeSessionDigest', () => {
	it('is deterministic for the same passcode and secret', () => {
		const a = computeSessionDigest('geheim123', 'secret-key');
		const b = computeSessionDigest('geheim123', 'secret-key');
		expect(a).toBe(b);
	});

	it('produces a different digest for a different passcode', () => {
		const correct = computeSessionDigest('geheim123', 'secret-key');
		const wrong = computeSessionDigest('anders456', 'secret-key');
		expect(wrong).not.toBe(correct);
	});

	it('produces a different digest for a different secret', () => {
		const a = computeSessionDigest('geheim123', 'secret-key-a');
		const b = computeSessionDigest('geheim123', 'secret-key-b');
		expect(a).not.toBe(b);
	});
});

describe('roles', () => {
	it('maps each passcode to its role', () => {
		expect(resolveRole('rw-code')).toBe('rw');
		expect(resolveRole('ro-code')).toBe('ro');
		expect(resolveRole('nope')).toBeNull();
	});

	it('maps each session cookie back to its role', () => {
		expect(getSessionRole(createSessionCookieValue('rw'))).toBe('rw');
		expect(getSessionRole(createSessionCookieValue('ro'))).toBe('ro');
		expect(getSessionRole('garbage')).toBeNull();
		expect(getSessionRole(undefined)).toBeNull();
	});
});
