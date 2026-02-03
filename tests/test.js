import { expect, test } from '@playwright/test';

test.describe('Root Page', () => {
	test('root page loads and displays welcome message', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Capture the Joy at Your Next Event');
	});
});

test.describe('Gallery Page', () => {
	const slug = 'aubri-and-travis';
	test('gallery page loads and displays event title', async ({ page }) => {
		await page.goto(`/${slug}`);
		await expect(page.locator('h1')).toContainText('Aubri and Travis');
	});

	test('event-specific primary color is applied', async ({ page }) => {
		await page.goto(`/${slug}`);
		// The primary color for aubri-and-travis is rebeccapurple (rgb(102, 51, 153))
		const headingDiv = page.locator('heading > div');
		await expect(headingDiv).toHaveCSS('background-color', 'rgb(102, 51, 153)');
	});

	test('gallery displays images', async ({ page }) => {
		await page.goto(`/${slug}`);
		// Check that the gallery container exists
		await page.waitForSelector('.gallery-item');
		const count = await page.locator('.gallery-item').count();
		expect(count).toBeGreaterThanOrEqual(4);
	});
});

test.describe('Admin Flow', () => {
	const slug = 'aubri-and-travis';
	test('admin login page loads', async ({ page }) => {
		await page.goto(`/${slug}/admin/login`);
		await expect(page.locator('h1')).toContainText('Admin Login');
		await expect(page.locator('form')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test('login form shows error on empty submission', async ({ page }) => {
		await page.goto(`/${slug}/admin/login`);
		const passwordInput = page.locator('#password');

		// Playwright handles the required attribute validation
		const loginButton = page.locator('button[type="submit"]');
		await loginButton.click();

		// Check if the input is still invalid
		const isInvalid = await passwordInput.evaluate((el) => el.validity.valueMissing);
		expect(isInvalid).toBeTruthy();
	});
});
