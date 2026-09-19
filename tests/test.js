import { expect, test } from '@playwright/test';

test.describe('Root Page', () => {
	test('root page loads and displays welcome message', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText('Capture the Joy at Your Next Event');
	});
});

test.describe('Gallery Page', () => {
	const slug = 'demo';

	test('gallery page loads and displays event container', async ({ page }) => {
		await page.goto(`/${slug}`);
		await expect(page.locator('h1')).toBeVisible();
	});

	test('gallery page container and layout are rendered', async ({ page }) => {
		await page.goto(`/${slug}`);
		await expect(page.locator('.gallery-page')).toBeVisible();
		await expect(page.locator('.event-header')).toBeVisible();
	});

	test('gallery displays images or empty gallery message', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-wrapper', { timeout: 10000 });
		const galleryWrapper = page.locator('.gallery-wrapper');
		await expect(galleryWrapper).toBeVisible();
	});
});

test.describe('Admin Flow', () => {
	const slug = 'demo';

	test('admin login page loads', async ({ page }) => {
		await page.goto(`/${slug}/admin/login`);
		await expect(page.locator('h1')).toContainText('Admin Login');
		await expect(page.locator('form')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
	});

	test('login form shows error on empty submission', async ({ page }) => {
		await page.goto(`/${slug}/admin/login`);
		const passwordInput = page.locator('#password');

		const loginButton = page.locator('button[type="submit"]');
		await loginButton.click();

		const isInvalid = await passwordInput.evaluate((el) => {
			const input = /** @type {HTMLInputElement} */ (el);
			return input.validity.valueMissing;
		});
		expect(isInvalid).toBeTruthy();
	});
});
