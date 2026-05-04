import { expect, test } from '@playwright/test';

test.describe('Admin Flow Download Optimization', () => {
	const slug = 'aubri-and-travis';

	test('downloadAll performs optimally with concurrency', async ({ page, baseURL }) => {
		// Mock the API response to return a list of images
		await page.route('**/api/image-list*', async (route) => {
			const images = [];
			for (let i = 0; i < 20; i++) {
				images.push({
					name: `test-image-${i}.jpg`,
					fullPath: `key-${i}`,
					url: `https://dummyimage.com/600x400/000/fff?text=${i}`,
					created: new Date().toISOString()
				});
			}
			await route.fulfill({ json: images });
		});

		// We need to keep track of concurrent requests to prove chunking vs worker pool
		let concurrentRequests = 0;
		let maxConcurrentRequests = 0;
		let completedRequests = 0;

		await page.route('https://dummyimage.com/**', async (route) => {
			concurrentRequests++;
			maxConcurrentRequests = Math.max(maxConcurrentRequests, concurrentRequests);

			const url = route.request().url();
			const textParam = new URL(url).searchParams.get('text');

			// 0, 5, 10, 15 are slow. They are the FIRST elements in each chunk.
			// With chunking, chunk 1 (0-4) starts. 0 is slow. 1-4 finish fast.
			// Then concurrency drops to 1 while waiting for 0.
			// Then chunk 2 (5-9) starts. 5 is slow. 6-9 finish fast.
			// Then concurrency drops to 1 while waiting for 5.
			let delay = 100;
			if (textParam === '0' || textParam === '5' || textParam === '10' || textParam === '15') {
				delay = 1000;
			}

			await new Promise((r) => setTimeout(r, delay));

			concurrentRequests--;
			completedRequests++;

			await route.fulfill({
				status: 200,
				contentType: 'image/jpeg',
				body: Buffer.from('fake image data')
			});
		});

		// Add cookie to bypass login
		const url = baseURL || 'http://localhost:4173';
		const domain = new URL(url).hostname;
		await page.context().addCookies([
			{
				name: 'session',
				value: 'admin',
				domain: domain,
				path: '/'
			}
		]);

		// Navigate directly to admin page
		await page.goto(`/${slug}/admin`);

		// Wait for the button
		const downloadBtn = page.locator('.download-all-btn');
		await expect(downloadBtn).toBeVisible();

		// Record start time
		const startTime = Date.now();

		await page.evaluate(() => {
			window.downloadFinished = false;
			const originalCreateObjectURL = URL.createObjectURL;
			URL.createObjectURL = function (obj) {
				window.downloadFinished = true;
				return originalCreateObjectURL(obj);
			};
		});

		await downloadBtn.click();

		// Wait for the download to complete
		await page.waitForFunction(() => window.downloadFinished === true, { timeout: 15000 });

		const endTime = Date.now();
		const duration = endTime - startTime;

		console.log(`Download took ${duration}ms. Max concurrent: ${maxConcurrentRequests}`);

		// If chunked: 4 chunks each taking 1000ms + slight overhead = ~4000ms
		// If worker pool: Workers churn through fast images, eventually get stuck on 4 slow ones.
		// All 4 slow ones run concurrently at the end taking max 1000ms. Total time ~1500ms.

		expect(duration).toBeLessThan(3000); // 3000ms is a safe threshold for the optimized version (which should take ~1100-1500ms)
	});
});
