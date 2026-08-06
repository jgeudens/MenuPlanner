/** Formats an ISO date string (YYYY-MM-DD) as a Dutch date, e.g. "6 augustus 2026". */
export function formatDateNl(isoDate: string): string {
	const [year, month, day] = isoDate.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return new Intl.DateTimeFormat('nl-NL', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

/** Returns today's date as an ISO date string (YYYY-MM-DD) in the local timezone. */
export function todayIso(): string {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}
