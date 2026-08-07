import { expect, test } from '@playwright/test';

const PASSCODE = process.env.HOUSEHOLD_PASSCODE ?? '';
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';

const mealName = `[e2e] Testgerecht ${Date.now()}`;

async function deleteSeededMeal() {
	await fetch(`${SUPABASE_URL}/rest/v1/meals?name=eq.${encodeURIComponent(mealName)}`, {
		method: 'DELETE',
		headers: {
			apikey: SUPABASE_PUBLISHABLE_KEY,
			Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
			'x-household-passcode': PASSCODE
		}
	});
}

test.afterEach(async () => {
	await deleteSeededMeal();
});

test('logging a meal end to end', async ({ page }) => {
	await page.goto('/login');
	await page.fill('#passcode', PASSCODE);
	await page.click('button[type=submit]');
	await expect(page).toHaveURL('/');

	await page.click('a[href="/meals/new"]');
	await expect(page).toHaveURL('/meals/new');

	await page.fill('#name', mealName);

	const ingredientInput = page.locator('input[placeholder="Ingrediënt toevoegen…"]');
	await ingredientInput.fill('e2e-tomaat');
	await page.getByRole('button', { name: /Nieuw:/ }).click();
	await ingredientInput.fill('e2e-kip');
	await page.getByRole('button', { name: /Nieuw:/ }).click();

	await page.getByRole('button', { name: '4 van 5 sterren' }).click();
	await page.fill('#notes', 'Lekker en snel klaar.');

	await page.click('button[type=submit]:has-text("Opslaan")');
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Gerecht opgeslagen.')).toBeVisible();

	const card = page.locator('a', { hasText: mealName });
	await expect(card).toBeVisible();
	await expect(card.getByLabel('Beoordeling: 4 van 5 sterren')).toBeVisible();
	await expect(card).toContainText('e2e-tomaat');
	await expect(card).toContainText('e2e-kip');
});
