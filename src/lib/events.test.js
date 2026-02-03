import { describe, it, expect, vi } from 'vitest';
import { getEvent } from './events.server';
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
            client.fetch.mockResolvedValue(mockEvent);

			const event = await getEvent('aubri-and-travis');
			expect(event.title).toBe('Aubri and Travis');
			expect(client.fetch).toHaveBeenCalled();
		});

		it('returns null when no slug is provided', async () => {
			const event = await getEvent(null);
			expect(event).toBeNull();
		});

		it('returns null when Sanity fetch fails', async () => {
			client.fetch.mockRejectedValue(new Error('Sanity error'));
			const event = await getEvent('some-slug');
			expect(event).toBeNull();
		});

		it('returns null when event is not found', async () => {
			client.fetch.mockResolvedValue(null);
			const event = await getEvent('non-existent');
			expect(event).toBeNull();
		});
		it('filters pibooth images via GROQ query when admin is false', async () => {
			const mockEvent = {
				title: 'Test Event',
				// Mock what the DB would return (filtered list)
				images: [{ name: 'photo1.jpg' }, { name: 'photo2.jpg' }]
			};
			client.fetch.mockResolvedValue(mockEvent);

			const event = await getEvent('test-event', false);

			// Verify correct params passed to Sanity
			expect(client.fetch).toHaveBeenCalledWith(
				expect.stringContaining('gallery[$showAllImages == true'),
				expect.objectContaining({
					slug: 'test-event',
					showAllImages: false
				})
			);

			// Verify result passes through
			expect(event.images).toHaveLength(2);
			expect(event.images.map((i) => i.name)).not.toContain('pibooth-capture.jpg');
		});

		it('requests all images via GROQ query when admin is true', async () => {
			const mockEvent = {
				title: 'Test Event',
				images: [{ name: 'photo1.jpg' }, { name: 'pibooth-capture.jpg' }]
			};
			client.fetch.mockResolvedValue(mockEvent);

			const event = await getEvent('test-event', true);

			// Verify correct params passed to Sanity
			expect(client.fetch).toHaveBeenCalledWith(
				expect.stringContaining('gallery[$showAllImages == true'),
				expect.objectContaining({
					slug: 'test-event',
					showAllImages: true
				})
			);

			expect(event.images).toHaveLength(2);
			expect(event.images.map((i) => i.name)).toContain('pibooth-capture.jpg');
		});
    });

    describe('getEventPassword', () => {
        it('returns event password when a valid slug is provided', async () => {
            const mockData = { adminPassword: 'secret-password' };
            client.fetch.mockResolvedValue(mockData);

            const result = await getEventPassword('test-event');
            expect(result).toEqual(mockData);
            expect(client.fetch).toHaveBeenCalledWith(
                expect.stringContaining('adminPassword'),
                { slug: 'test-event' }
            );
        });

        it('returns null when no slug is provided', async () => {
            const event = await getEvent(null);
            expect(event).toBeNull();
        });

        it('returns null when Sanity fetch fails', async () => {
            client.fetch.mockRejectedValue(new Error('Sanity error'));
            const event = await getEvent('some-slug');
            expect(event).toBeNull();
        });

        it('returns null when event is not found', async () => {
            client.fetch.mockResolvedValue(null);
            const event = await getEvent('non-existent');
            expect(event).toBeNull();
        });
        it('filters pibooth images when admin is false', async () => {
            const mockEvent = {
                title: 'Test Event',
                images: [
                    { name: 'photo1.jpg' },
                    { name: 'pibooth-capture.jpg' },
                    { name: 'photo2.jpg' }
                ]
            };
            client.fetch.mockResolvedValue(mockEvent);

            const event = await getEvent('test-event', false);
            expect(event.images).toHaveLength(2);
            expect(event.images.map(i => i.name)).not.toContain('pibooth-capture.jpg');
        });

        it('shows all images when admin is true', async () => {
            const mockEvent = {
                title: 'Test Event',
                images: [
                    { name: 'photo1.jpg' },
                    { name: 'pibooth-capture.jpg' }
                ]
            };
            client.fetch.mockResolvedValue(mockEvent);

            const event = await getEvent('test-event', true);
            expect(event.images).toHaveLength(2);
            expect(event.images.map(i => i.name)).toContain('pibooth-capture.jpg');
        });
    });
});
