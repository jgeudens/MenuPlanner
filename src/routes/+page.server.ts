import type { PageServerLoad } from './$types';
import { listRecentMeals } from '$lib/server/meals';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url, locals }) => {
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
	const offset = (page - 1) * PAGE_SIZE;

	const rows = await listRecentMeals(locals.db, PAGE_SIZE + 1, offset);
	const hasMore = rows.length > PAGE_SIZE;
	const meals = rows.slice(0, PAGE_SIZE);

	return { meals, page, hasMore };
};
