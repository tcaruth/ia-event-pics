import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
	test('Root page loads', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});
});
