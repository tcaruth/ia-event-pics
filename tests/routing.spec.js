import { test, expect } from '@playwright/test';

test.describe('Routing', () => {
	const slug = 'demo';
	const masterPassword = 'T156423c0.';

	test('Gallery page loads for demo event', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-page', { timeout: 10000 });
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('Gallery page displays main wrapper', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-wrapper', { timeout: 10000 });
		const wrapper = page.locator('.gallery-wrapper');
		await expect(wrapper).toBeVisible();
	});

	test('Navigating to image viewer if images are available', async ({ page }) => {
		await page.goto(`/${slug}`);
		await page.waitForSelector('.gallery-wrapper', { timeout: 10000 });
		const items = page.locator('.gallery-item');
		const count = await items.count();
		if (count > 0) {
			await items.first().click();
			await expect(page.locator('.image-viewer')).toBeVisible({ timeout: 10000 });
		} else {
			// If demo event gallery is currently empty, verify direct navigation to image viewer handles missing images cleanly
			await page.goto(`/${slug}/sample.jpg`);
			await expect(page.locator('.image-viewer')).toBeVisible({ timeout: 10000 });
		}
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
