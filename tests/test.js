import { expect, test } from '@playwright/test';

test.describe('Root Page', () => {
	test('root page loads and displays welcome message', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Capture the Joy at Your Next Event');
	});
});
