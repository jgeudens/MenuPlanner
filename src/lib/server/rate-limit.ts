import { checkRateLimit, recordFailure, recordSuccess, pruneExpired } from '$lib/rate-limit';
import type { RateLimitState, RateLimitCheck } from '$lib/rate-limit';

const loginAttempts: RateLimitState = new Map();

export function checkLoginRateLimit(ip: string): RateLimitCheck {
	const now = Date.now();
	pruneExpired(loginAttempts, now);
	return checkRateLimit(loginAttempts, ip, now);
}

export function recordLoginFailure(ip: string): void {
	recordFailure(loginAttempts, ip, Date.now());
}

export function recordLoginSuccess(ip: string): void {
	recordSuccess(loginAttempts, ip);
}
