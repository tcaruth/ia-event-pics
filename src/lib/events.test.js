import { describe, it, expect, vi } from 'vitest';
import { getEvent, getEventPassword } from './events.server';
import { client } from './sanity';

vi.mock('./sanity', () => ({
    client: {
        fetch: vi.fn()
    }
}));

describe('events.server.js', () => {
    describe('getEvent', () => {
        it('returns event data when a valid slug is provided', async () => {
            const mockEvent = {
                title: 'Aubri and Travis',
                name: 'Aubri and Travis',
                slug: 'aubri-and-travis'
            };
            vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (mockEvent));

			const event = await getEvent('aubri-and-travis');
			expect(event?.title).toBe('Aubri and Travis');
			expect(client.fetch).toHaveBeenCalled();
		});

		it('returns null when no slug is provided', async () => {
			const event = await getEvent(/** @type {any} */ (null));
			expect(event).toBeNull();
		});

		it('returns null when Sanity fetch fails', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.mocked(client.fetch).mockRejectedValue(new Error('Sanity error'));
			const event = await getEvent('some-slug');
			expect(event).toBeNull();
			consoleSpy.mockRestore();
		});

		it('returns null when event is not found', async () => {
			vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (null));
			const event = await getEvent('non-existent');
			expect(event).toBeNull();
		});

		it('filters pibooth images via GROQ query when admin is false', async () => {
			const mockEvent = {
				title: 'Test Event',
				images: [{ name: 'photo1.jpg' }, { name: 'photo2.jpg' }]
			};
			vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (mockEvent));

			const event = await getEvent('test-event', false);

			expect(client.fetch).toHaveBeenCalledWith(
				expect.stringContaining('gallery[$showAllImages == true'),
				expect.objectContaining({
					slug: 'test-event',
					showAllImages: false
				})
			);

			expect(event?.images).toHaveLength(2);
			expect(event?.images.map((i) => i.name)).not.toContain('pibooth-capture.jpg');
		});

		it('requests all images via GROQ query when admin is true', async () => {
			const mockEvent = {
				title: 'Test Event',
				images: [{ name: 'photo1.jpg' }, { name: 'pibooth-capture.jpg' }]
			};
			vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (mockEvent));

			const event = await getEvent('test-event', true);

			expect(client.fetch).toHaveBeenCalledWith(
				expect.stringContaining('gallery[$showAllImages == true'),
				expect.objectContaining({
					slug: 'test-event',
					showAllImages: true
				})
			);

			expect(event?.images).toHaveLength(2);
			expect(event?.images.map((i) => i.name)).toContain('pibooth-capture.jpg');
		});
    });

    describe('getEventPassword', () => {
        it('returns event password when a valid slug is provided', async () => {
            const mockData = { adminPassword: 'secret-password' };
            vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (mockData));

            const result = await getEventPassword('test-event');
            expect(result).toEqual(mockData);
            expect(client.fetch).toHaveBeenCalledWith(
                expect.stringContaining('adminPassword'),
                { slug: 'test-event' }
            );
        });

        it('returns null when no slug is provided', async () => {
            const result = await getEventPassword(/** @type {any} */ (null));
            expect(result).toBeNull();
        });

        it('returns null when Sanity fetch fails', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(client.fetch).mockRejectedValue(new Error('Sanity error'));
            const result = await getEventPassword('some-slug');
            expect(result).toBeNull();
			consoleSpy.mockRestore();
        });

        it('returns null when event is not found', async () => {
            vi.mocked(client.fetch).mockResolvedValue(/** @type {any} */ (null));
            const result = await getEventPassword('non-existent');
            expect(result).toBeNull();
        });
    });
});
