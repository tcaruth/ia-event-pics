import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
	const slug = 'aubri-and-travis';
	const masterPassword = 'T156423c0.'; // From .env

	test('Gallery page loads', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-item', { timeout: 10000 });
		const count = await page.locator('.gallery-item').count();
		expect(count).toBeGreaterThanOrEqual(4);
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('Gallery has images', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-item img', { timeout: 10000 });
		const count = await page.locator('.gallery-item img').count();
		expect(count).toBeGreaterThanOrEqual(4);
	});

	test('Navigating to image viewer', async ({ page }) => {
		await page.goto(`/${slug}`);
		const links = page.locator('.gallery-item');
		await links.first().waitFor({ state: 'visible' });
		await links.first().click();
		await expect(page.locator('.image-viewer')).toBeVisible({ timeout: 10000 });
	});

	test('Admin page redirects to login and allows login', async ({ page }) => {
		// Visit admin
		await page.goto(`/${slug}/admin`);

		// Assert redirect to login
		await expect(page).toHaveURL(new RegExp(`/${slug}/admin/login`));

		// Fill login
		await page.fill('input[name="password"]', masterPassword);
		await page.click('button[type="submit"]');

		// Assert redirect back to admin dashboard
		await expect(page).toHaveURL(new RegExp(`/${slug}/admin`));
		await expect(page.locator('h1')).toHaveText('Admin Dashboard', { timeout: 10000 });
		await expect(page.locator('.admin-container')).toBeVisible();
	});
});
