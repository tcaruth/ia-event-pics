import { test, expect } from '@playwright/test';

test('homepage has expected content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Capture the Joy at Your Next Event');
  await page.screenshot({ path: 'verification/homepage.png', fullPage: true });
});
