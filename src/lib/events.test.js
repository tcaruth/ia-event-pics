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
    });
});
