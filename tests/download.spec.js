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

		// Mock the image fetching to add variable delay
		let fetchCounts = 0;
		await page.route('https://dummyimage.com/**', async (route) => {
			fetchCounts++;

			const url = route.request().url();
			const textParam = new URL(url).searchParams.get('text');

			let delay = 100; // fast images take 100ms
			// Add more significant delays to explicitly test chunking vs concurrency
			if (textParam === '0' || textParam === '5' || textParam === '10' || textParam === '15') {
				delay = 1000; // slow images take 1s
			}

			// Add the delay
			await new Promise((r) => setTimeout(r, delay));

			await route.fulfill({
				status: 200,
				contentType: 'image/jpeg',
				body: Buffer.from('fake image data') // fake image data to speed up test
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

		// We can't easily wait for the download to finish without intercepting the blob creation
		// So let's add an event listener to the window when the download is complete
		await page.evaluate(() => {
			window.downloadFinished = false;
			const originalCreateObjectURL = URL.createObjectURL;
			URL.createObjectURL = function (obj) {
				window.downloadFinished = true;
				return originalCreateObjectURL(obj);
			};
		});

		// Also handle dialogs (we added alerts for failures, but we expect no failures here)
		page.on('dialog', async (dialog) => {
			await dialog.accept();
		});

		await downloadBtn.click();

		// Wait for the download to complete
		await page.waitForFunction(() => window.downloadFinished === true, { timeout: 10000 });

		const endTime = Date.now();
		const duration = endTime - startTime;

		console.log(`Download took ${duration}ms`);

		// 3000ms is a safe threshold for the optimized version (which should take ~1100-1500ms)
		expect(duration).toBeLessThan(3000);
	});
});
