import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { client } from '$lib/sanity';

vi.mock('$lib/sanity', () => ({
	client: {
		fetch: vi.fn(),
		patch: vi.fn()
	}
}));

vi.mock('$env/static/private', () => ({
	MASTER_ADMIN_PASSWORD: 'master-password'
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

			const result = await actions.print({ request, params });
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

			vi.mocked(client.fetch).mockResolvedValue(null);

			const result = await actions.print({ request, params });
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

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-doc-id', isPhotoboothActive: false });

			const result = await actions.print({ request, params });
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

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-doc-id', isPhotoboothActive: true });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockAppend = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockSetIfMissing = vi.fn().mockReturnValue({ append: mockAppend });
			const mockPatch = vi.fn().mockReturnValue({ setIfMissing: mockSetIfMissing });

			vi.mocked(client.patch).mockImplementation(mockPatch);

			const result = await actions.print({ request, params });

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

	describe('unlockMaster action', () => {
		it('returns error on incorrect password', async () => {
			const formData = new Map([['password', 'wrong']]);
			const request = { formData: async () => formData };
			const cookies = { set: vi.fn() };

			const result = await actions.unlockMaster({ request, cookies });
			expect(result).toEqual({ success: false, error: 'Incorrect master password' });
			expect(cookies.set).not.toHaveBeenCalled();
		});

		it('sets master session on correct password', async () => {
			const formData = new Map([['password', 'master-password']]);
			const request = { formData: async () => formData };
			const cookies = { set: vi.fn() };

			const result = await actions.unlockMaster({ request, cookies });
			expect(result).toEqual({ success: true, message: 'Master admin access granted' });
			expect(cookies.set).toHaveBeenCalledWith(
				'session',
				'master',
				expect.objectContaining({ path: '/', httpOnly: true })
			);
		});
	});

	describe('deleteBatch action', () => {
		it('rejects if not master admin and no master password provided', async () => {
			const formData = new Map([['keys', JSON.stringify(['k1', 'k2'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };
			const cookies = { get: vi.fn().mockReturnValue('admin'), set: vi.fn() };

			const result = await actions.deleteBatch({ request, params, cookies });
			expect(result).toEqual({
				success: false,
				error: 'Batch deletion is restricted to master administrators.'
			});
		});

		it('rejects if keys are empty', async () => {
			const formData = new Map([['keys', JSON.stringify([])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };
			const cookies = { get: vi.fn().mockReturnValue('master'), set: vi.fn() };

			const result = await actions.deleteBatch({ request, params, cookies });
			expect(result).toEqual({
				success: false,
				error: 'At least one photo must be selected for deletion.'
			});
		});

		it('rejects if event is not found', async () => {
			const formData = new Map([['keys', JSON.stringify(['k1'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'non-existent' };
			const cookies = { get: vi.fn().mockReturnValue('master'), set: vi.fn() };

			vi.mocked(client.fetch).mockResolvedValue(null);

			const result = await actions.deleteBatch({ request, params, cookies });
			expect(result).toEqual({ success: false, error: 'Event not found' });
		});

		it('successfully unsets keys in Sanity with master session', async () => {
			const formData = new Map([['keys', JSON.stringify(['key-1', 'key-2'])]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };
			const cookies = { get: vi.fn().mockReturnValue('master'), set: vi.fn() };

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-123' });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockUnset = vi.fn().mockReturnValue({ commit: mockCommit });
			const mockPatch = vi.fn().mockReturnValue({ unset: mockUnset });
			vi.mocked(client.patch).mockImplementation(mockPatch);

			const result = await actions.deleteBatch({ request, params, cookies });

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

		it('allows deletion and upgrades session when master password is provided directly', async () => {
			const formData = new Map([
				['keys', JSON.stringify(['key-1'])],
				['masterPassword', 'master-password']
			]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };
			const cookies = { get: vi.fn().mockReturnValue('admin'), set: vi.fn() };

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-123' });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockUnset = vi.fn().mockReturnValue({ commit: mockCommit });
			vi.mocked(client.patch).mockReturnValue({ unset: mockUnset });

			const result = await actions.deleteBatch({ request, params, cookies });

			expect(cookies.set).toHaveBeenCalledWith(
				'session',
				'master',
				expect.objectContaining({ path: '/', httpOnly: true })
			);
			expect(result.success).toBe(true);
			expect(result.deletedCount).toBe(1);
		});

		it('chunks large batches of keys into groups of 50', async () => {
			const largeKeyList = Array.from({ length: 120 }, (_, i) => `key-${i}`);
			const formData = new Map([['keys', JSON.stringify(largeKeyList)]]);
			const request = { formData: async () => formData };
			const params = { slug: 'test-event' };
			const cookies = { get: vi.fn().mockReturnValue('master'), set: vi.fn() };

			vi.mocked(client.fetch).mockResolvedValue({ _id: 'event-123' });

			const mockCommit = vi.fn().mockResolvedValue({});
			const mockUnset = vi.fn().mockReturnValue({ commit: mockCommit });
			vi.mocked(client.patch).mockReturnValue({ unset: mockUnset });

			const result = await actions.deleteBatch({ request, params, cookies });

			expect(mockUnset).toHaveBeenCalledTimes(3); // 50, 50, 20
			expect(result.deletedCount).toBe(120);
		});
	});
});
