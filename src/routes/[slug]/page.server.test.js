import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import * as eventsServer from '$lib/events.server';

vi.mock('$lib/events.server', () => ({
	getEvent: vi.fn()
}));

describe('[slug] Page Server Loader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads event and images for a valid slug', async () => {
		const mockEvent = {
			title: 'Demo Event',
			slug: 'demo',
			images: [{ name: 'photo1.jpg' }]
		};
		vi.mocked(eventsServer.getEvent).mockResolvedValue(mockEvent);

		const result = await load({ params: { slug: 'demo' } });

		expect(eventsServer.getEvent).toHaveBeenCalledWith('demo', false);
		expect(result).toEqual({
			images: mockEvent.images,
			event: mockEvent,
			slug: 'demo'
		});
	});

	it('returns empty images array when event is null', async () => {
		vi.mocked(eventsServer.getEvent).mockResolvedValue(null);

		const result = await load({ params: { slug: 'non-existent' } });

		expect(result).toEqual({
			images: [],
			event: null,
			slug: 'non-existent'
		});
	});
});
