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

	describe('deleteBatch action', () => {
		it('rejects if keys are empty', async () => {
			const formData = new Map([['keys', JSON.stringify([])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			const result = await actions.deleteBatch({ request, params });
			expect(result).toEqual({
				success: false,
				error: 'At least one photo must be selected for deletion.'
			});
		});

		it('rejects if event is not found', async () => {
			const formData = new Map([['keys', JSON.stringify(['k1'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'non-existent' };

			vi.mocked(client.fetch).mockResolvedValue(null);

			const result = await actions.deleteBatch({ request, params });
			expect(result).toEqual({ success: false, error: 'Event not found' });
		});

		it('successfully unsets keys in Sanity', async () => {
			const formData = new Map([['keys', JSON.stringify(['key-1', 'key-2'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-123' });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockUnset = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockPatch = vi.fn().mockReturnValue({ unset: mockUnset });
			vi.mocked(client.patch).mockImplementation(mockPatch);

			const result = await actions.deleteBatch({ request, params });

			expect(client.patch).toHaveBeenCalledWith('event-123');
			expect(mockUnset).toHaveBeenCalledWith([
				'gallery[_key=="key-1"]',
				'gallery[_key=="key-2"]'
			]);
			expect(result).toEqual({
				success: true,
				deletedCount: 2,
				message: 'Successfully deleted 2 photos.'
			});
		});

		it('chunks large batches of keys into groups of 50', async () => {
			const largeKeyList = Array.from({ length: 120 }, (_, i) => `key-${i}`);
			const formData = new Map([['keys', JSON.stringify(largeKeyList)]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-123' });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockUnset = vi.fn().mockReturnValue({ commit: mockCommit });
			vi.mocked(client.patch).mockReturnValue({ unset: mockUnset });

			const result = await actions.deleteBatch({ request, params });

			expect(mockUnset).toHaveBeenCalledTimes(3); // 50, 50, 20
			expect(result.deletedCount).toBe(120);
		});
	});

	describe('printBatch action', () => {
		it('returns error if images or keys are empty', async () => {
			const formData = new Map([['images', JSON.stringify([])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			const result = await actions.printBatch({ request, params });
			expect(result).toEqual({
				success: false,
				error: 'At least one photo must be selected for printing.'
			});
		});

		it('returns error if event is not found', async () => {
			const formData = new Map([
				[
					'images',
					JSON.stringify([
						{ fullPath: 'k1', assetUrl: 'https://cdn.sanity.io/img.jpg', imageName: 'p1.jpg' }
					])
				]
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'non-existent' };

			vi.mocked(client.fetch).mockResolvedValue(null);

			const result = await actions.printBatch({ request, params });
			expect(result).toEqual({ success: false, error: 'Event not found' });
		});

		it('returns error if photobooth is not active', async () => {
			const formData = new Map([
				[
					'images',
					JSON.stringify([
						{ fullPath: 'k1', assetUrl: 'https://cdn.sanity.io/img.jpg', imageName: 'p1.jpg' }
					])
				]
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'inactive-event' };

			vi.mocked(client.fetch).mockResolvedValue({
				_id: 'event-123',
				isPhotoboothActive: false,
				gallery: []
			});

			const result = await actions.printBatch({ request, params });
			expect(result).toEqual({
				success: false,
				error: 'Printing is only available while the event is active and assigned to a photobooth'
			});
		});

		it('successfully queues batch print tasks to Sanity printQueue', async () => {
			const items = [
				{ fullPath: 'k1', assetUrl: 'https://cdn.sanity.io/img1.jpg', imageName: 'photo1.jpg' },
				{ fullPath: 'k2', assetUrl: 'https://cdn.sanity.io/img2.jpg', imageName: 'photo2.jpg' }
			];
			const formData = new Map([['images', JSON.stringify(items)]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue({
				_id: 'event-123',
				isPhotoboothActive: true,
				gallery: []
			});

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockAppend = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockSetIfMissing = vi.fn().mockReturnValue({ append: mockAppend });
			const mockPatch = vi.fn().mockReturnValue({ setIfMissing: mockSetIfMissing });
			vi.mocked(client.patch).mockImplementation(mockPatch);

			const result = await actions.printBatch({ request, params });

			expect(client.patch).toHaveBeenCalledWith('event-123');
			expect(mockSetIfMissing).toHaveBeenCalledWith({ printQueue: [] });
			expect(mockAppend).toHaveBeenCalledWith(
				'printQueue',
				expect.arrayContaining([
					expect.objectContaining({
						imageKey: 'k1',
						assetUrl: 'https://cdn.sanity.io/img1.jpg',
						imageName: 'photo1.jpg',
						status: 'pending'
					}),
					expect.objectContaining({
						imageKey: 'k2',
						assetUrl: 'https://cdn.sanity.io/img2.jpg',
						imageName: 'photo2.jpg',
						status: 'pending'
					})
				])
			);
			expect(result).toEqual({
				success: true,
				message: 'Queued 2 photos for printing.'
			});
		});

		it('resolves photo details from gallery if only keys are provided', async () => {
			const formData = new Map([['keys', JSON.stringify(['k1'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue({
				_id: 'event-123',
				isPhotoboothActive: true,
				gallery: [{ key: 'k1', url: 'https://cdn.sanity.io/resolved.jpg', name: 'resolved.jpg' }]
			});

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockAppend = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockSetIfMissing = vi.fn().mockReturnValue({ append: mockAppend });
			vi.mocked(client.patch).mockReturnValue({ setIfMissing: mockSetIfMissing });

			const result = await actions.printBatch({ request, params });

			expect(mockAppend).toHaveBeenCalledWith(
				'printQueue',
				expect.arrayContaining([
					expect.objectContaining({
						imageKey: 'k1',
						assetUrl: 'https://cdn.sanity.io/resolved.jpg',
						imageName: 'resolved.jpg',
						status: 'pending'
					})
				])
			);
			expect(result.success).toBe(true);
		});

		it('chunks large batches of print tasks into groups of 50', async () => {
			const items = Array.from({ length: 110 }, (_, i) => ({
				fullPath: `k${i}`,
				assetUrl: `https://cdn.sanity.io/img${i}.jpg`,
				imageName: `photo${i}.jpg`
			}));
			const formData = new Map([['images', JSON.stringify(items)]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };

			vi.mocked(client.fetch).mockResolvedValue({
				_id: 'event-123',
				isPhotoboothActive: true,
				gallery: []
			});

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockAppend = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockSetIfMissing = vi.fn().mockReturnValue({ append: mockAppend });
			vi.mocked(client.patch).mockReturnValue({ setIfMissing: mockSetIfMissing });

			const result = await actions.printBatch({ request, params });

			expect(mockAppend).toHaveBeenCalledTimes(3); // 50, 50, 10
			expect(result.success).toBe(true);
			expect(result.message).toBe('Queued 110 photos for printing.');
		});
	});
});
