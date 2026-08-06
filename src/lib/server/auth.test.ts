import { describe, expect, it } from 'vitest';
import { computeSessionDigest } from './auth';

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
