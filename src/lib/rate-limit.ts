export type AttemptRecord = {
	failures: number;
	lastFailureAt: number;
	lockedUntil: number | null;
};

export type RateLimitState = Map<string, AttemptRecord>;

export type RateLimitCheck = { allowed: true } | { allowed: false; retryAfterMs: number };

export const MAX_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
export const STALE_MS = 60 * 60 * 1000;

export function checkRateLimit(state: RateLimitState, key: string, now: number): RateLimitCheck {
	const record = state.get(key);
	if (!record || record.lockedUntil === null) {
		return { allowed: true };
	}
	if (now >= record.lockedUntil) {
		state.delete(key);
		return { allowed: true };
	}
	return { allowed: false, retryAfterMs: record.lockedUntil - now };
}

export function recordFailure(state: RateLimitState, key: string, now: number): void {
	const record = state.get(key) ?? { failures: 0, lastFailureAt: now, lockedUntil: null };
	record.failures += 1;
	record.lastFailureAt = now;
	if (record.failures >= MAX_ATTEMPTS) {
		record.lockedUntil = now + LOCKOUT_MS;
	}
	state.set(key, record);
}

export function recordSuccess(state: RateLimitState, key: string): void {
	state.delete(key);
}

export function pruneExpired(state: RateLimitState, now: number): void {
	for (const [key, record] of state) {
		const expiredLockout = record.lockedUntil !== null && now >= record.lockedUntil;
		const staleWithoutLockout =
			record.lockedUntil === null && now - record.lastFailureAt >= STALE_MS;
		if (expiredLockout || staleWithoutLockout) {
			state.delete(key);
		}
	}
}
