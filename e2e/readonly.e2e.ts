import { expect, test } from '@playwright/test';

const READONLY_PASSCODE = process.env.READONLY_PASSCODE ?? '';
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';

test('read-only passcode can view but not write', async ({ page }) => {
	await page.goto('/login');
	await page.fill('#passcode', READONLY_PASSCODE);
	await page.click('button[type=submit]');
	await expect(page).toHaveURL('/');

	await expect(page.getByText('Alleen lezen').first()).toBeVisible();
	await expect(page.locator('a[href="/meals/new"]')).toHaveCount(0);
	await expect(page.locator('a[href="/admin"]')).toHaveCount(0);

	await page.goto('/meals/new');
	await expect(page).toHaveURL('/');
	await page.goto('/admin');
	await expect(page).toHaveURL('/');

	const post = await page.request.post('/meals/new', { form: { name: 'x' } });
	expect(post.status()).toBe(403);
});

test('database rejects writes with the read-only passcode', async ({ request }) => {
	const response = await request.post(`${SUPABASE_URL}/rest/v1/ingredients`, {
		headers: {
			apikey: SUPABASE_PUBLISHABLE_KEY,
			Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
			'x-household-passcode': READONLY_PASSCODE
		},
		data: { name: '[e2e] readonly-check' }
	});
	expect(response.ok()).toBe(false);
});
