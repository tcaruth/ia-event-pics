import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { client } from '$lib/sanity';

vi.mock('$lib/sanity', () => ({
	client: {
		fetch: vi.fn(),
		patch: vi.fn()
	}
}));

describe('Admin Page Actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('print action', () => {
		it('returns error if key or assetUrl are missing', async () => {
			const formData = new Map();
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			const result = await (/** @type {any} */ (actions.print))({ request, params });
			expect(result).toEqual({
				success: false,
				error: 'Image details are required for printing'
			});
		});

		it('returns error if event is not found', async () => {
			const formData = new Map([
				['fullPath', 'img_key_123'],
				['assetUrl', 'https://cdn.sanity.io/images/proj/ds/image.jpg'],
				['imageName', 'test.jpg']
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'non-existent' };

			vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (null));

			const result = await (/** @type {any} */ (actions.print))({ request, params });
			expect(result).toEqual({ success: false, error: 'Event not found' });
		});

		it('returns error if event is not active and assigned to a photobooth', async () => {
			const formData = new Map([
				['fullPath', 'img_key_123'],
				['assetUrl', 'https://cdn.sanity.io/images/proj/ds/image.jpg'],
				['imageName', 'test.jpg']
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'inactive-event' };

			vi.mocked(client.fetch).mockResolvedValue(
				/** @type {any} */ ({ _id: 'event-doc-id', isPhotoboothActive: false })
			);

			const result = await (/** @type {any} */ (actions.print))({ request, params });
			expect(result).toEqual({
				success: false,
				error: 'Printing is only available while the event is active and assigned to a photobooth'
			});
		});

		it('successfully queues a print task', async () => {
			const formData = new Map([
				['fullPath', 'img_key_123'],
				['assetUrl', 'https://cdn.sanity.io/images/proj/ds/image.jpg'],
				['imageName', 'photo_1.jpg']
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue(
				/** @type {any} */ ({ _id: 'event-doc-id', isPhotoboothActive: true })
			);

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockAppend = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockSetIfMissing = vi.fn().mockReturnValue({ append: mockAppend });
			const mockPatch = vi.fn().mockReturnValue({ setIfMissing: mockSetIfMissing });

			vi.mocked(client.patch).mockImplementation(mockPatch);

			const result = await (/** @type {any} */ (actions.print))({ request, params });

			expect(client.patch).toHaveBeenCalledWith('event-doc-id');
			expect(mockSetIfMissing).toHaveBeenCalledWith({ printQueue: [] });
			expect(mockAppend).toHaveBeenCalledWith(
				'printQueue',
				expect.arrayContaining([
					expect.objectContaining({
						imageKey: 'img_key_123',
						assetUrl: 'https://cdn.sanity.io/images/proj/ds/image.jpg',
						imageName: 'photo_1.jpg',
						status: 'pending'
					})
				])
			);
			expect(result).toEqual({
				success: true,
				message: 'Print job queued for photo_1.jpg'
			});
		});
	});
});
