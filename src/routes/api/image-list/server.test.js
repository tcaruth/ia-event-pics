import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './+server';
import { client } from '$lib/sanity';

vi.mock('$lib/sanity', () => ({
	client: {
		fetch: vi.fn()
	}
}));

describe('API Endpoint GET /api/image-list', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when event parameter is missing', async () => {
		const requestUrl = new URL('http://localhost/api/image-list');
		const response = await GET({ url: requestUrl });

		expect(response.status).toBe(400);
		const json = await response.json();
		expect(json).toEqual({ error: 'Event slug is required' });
	});

	it('returns formatted image list for valid event', async () => {
		const requestUrl = new URL('http://localhost/api/image-list?event=demo');
		const mockGallery = [
			{
				url: 'https://cdn.sanity.io/img1.jpg',
				name: 'photo1.jpg',
				created: '2026-07-31T12:00:00Z',
				id: 'asset-1',
				key: 'key-1'
			}
		];
		vi.mocked(client.fetch).mockResolvedValue({ gallery: mockGallery });

		const response = await GET({ url: requestUrl });

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual([
			{
				name: 'photo1.jpg',
				fullPath: 'key-1',
				url: 'https://cdn.sanity.io/img1.jpg',
				created: '2026-07-31T12:00:00Z'
			}
		]);
	});

	it('returns empty array when gallery is null or missing', async () => {
		const requestUrl = new URL('http://localhost/api/image-list?event=empty-event');
		vi.mocked(client.fetch).mockResolvedValue(null);

		const response = await GET({ url: requestUrl });

		expect(response.status).toBe(200);
		const json = await response.json();
		expect(json).toEqual([]);
	});

	it('returns 500 when Sanity fetch throws an error', async () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const requestUrl = new URL('http://localhost/api/image-list?event=error');
		vi.mocked(client.fetch).mockRejectedValue(new Error('Sanity timeout'));

		const response = await GET({ url: requestUrl });

		expect(response.status).toBe(500);
		const json = await response.json();
		expect(json).toEqual({ error: 'Sanity timeout' });
		consoleSpy.mockRestore();
	});
});
