import { describe, expect, it } from 'vitest';
import { formatDateNl } from './utils';

describe('formatDateNl', () => {
	it('formats an ISO date as a Dutch date string', () => {
		expect(formatDateNl('2026-08-06')).toBe('6 augustus 2026');
	});

	it('does not shift the date across a timezone boundary', () => {
		expect(formatDateNl('2026-01-01')).toBe('1 januari 2026');
		expect(formatDateNl('2026-12-31')).toBe('31 december 2026');
	});
});
