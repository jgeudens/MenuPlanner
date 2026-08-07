import { describe, expect, it } from 'vitest';
import {
	checkRateLimit,
	recordFailure,
	recordSuccess,
	pruneExpired,
	MAX_ATTEMPTS,
	LOCKOUT_MS,
	STALE_MS,
	type RateLimitState
} from './rate-limit';

describe('checkRateLimit / recordFailure', () => {
	it('allows a key with no prior attempts', () => {
		const state: RateLimitState = new Map();
		expect(checkRateLimit(state, '1.2.3.4', 0)).toEqual({ allowed: true });
	});

	it('allows attempts below the lockout threshold', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		expect(checkRateLimit(state, '1.2.3.4', 0)).toEqual({ allowed: true });
	});

	it('locks out a key after MAX_ATTEMPTS failures', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		const result = checkRateLimit(state, '1.2.3.4', 0);
		expect(result.allowed).toBe(false);
		if (!result.allowed) expect(result.retryAfterMs).toBe(LOCKOUT_MS);
	});

	it('stays locked out until lockedUntil passes', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		expect(checkRateLimit(state, '1.2.3.4', LOCKOUT_MS - 1).allowed).toBe(false);
	});

	it('unlocks and resets once the lockout expires', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		expect(checkRateLimit(state, '1.2.3.4', LOCKOUT_MS).allowed).toBe(true);
		expect(state.has('1.2.3.4')).toBe(false);
	});

	it('tracks separate keys independently', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		expect(checkRateLimit(state, '5.6.7.8', 0)).toEqual({ allowed: true });
	});
});

describe('recordSuccess', () => {
	it('clears an in-progress failure count', () => {
		const state: RateLimitState = new Map();
		recordFailure(state, '1.2.3.4', 0);
		recordFailure(state, '1.2.3.4', 0);
		recordSuccess(state, '1.2.3.4');
		expect(state.has('1.2.3.4')).toBe(false);
	});
});

describe('pruneExpired', () => {
	it('removes an expired lockout', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		pruneExpired(state, LOCKOUT_MS);
		expect(state.has('1.2.3.4')).toBe(false);
	});

	it('removes a stale entry that never got locked out', () => {
		const state: RateLimitState = new Map();
		recordFailure(state, '1.2.3.4', 0);
		pruneExpired(state, STALE_MS);
		expect(state.has('1.2.3.4')).toBe(false);
	});

	it('keeps an active, non-expired lockout', () => {
		const state: RateLimitState = new Map();
		for (let i = 0; i < MAX_ATTEMPTS; i++) {
			recordFailure(state, '1.2.3.4', 0);
		}
		pruneExpired(state, LOCKOUT_MS - 1);
		expect(state.has('1.2.3.4')).toBe(true);
	});

	it('keeps a recent, non-locked entry', () => {
		const state: RateLimitState = new Map();
		recordFailure(state, '1.2.3.4', 0);
		pruneExpired(state, STALE_MS - 1);
		expect(state.has('1.2.3.4')).toBe(true);
	});
});
