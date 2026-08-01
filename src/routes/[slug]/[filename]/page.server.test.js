import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';
import * as eventsServer from '$lib/events.server';

vi.mock('$lib/events.server', () => ({
	getEvent: vi.fn()
}));

describe('[slug]/[filename] Page Server Loader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('finds matching image by filename within event', async () => {
		const mockEvent = {
			title: 'Demo Event',
			slug: 'demo',
			images: [
				{ name: 'photo1.jpg', url: 'https://cdn.sanity.io/photo1.jpg' },
				{ name: 'photo2.jpg', url: 'https://cdn.sanity.io/photo2.jpg' }
			]
		};
		vi.mocked(eventsServer.getEvent).mockResolvedValue(mockEvent);

		const result = await load({ params: { slug: 'demo', filename: 'photo2.jpg' } });

		expect(eventsServer.getEvent).toHaveBeenCalledWith('demo');
		expect(result).toEqual({
			event: mockEvent,
			image: mockEvent.images[1],
			slug: 'demo',
			filename: 'photo2.jpg'
		});
	});

	it('returns undefined image when filename is not found', async () => {
		vi.mocked(eventsServer.getEvent).mockResolvedValue({ images: [] });

		const result = await load({ params: { slug: 'demo', filename: 'missing.jpg' } });

		expect(result.image).toBeUndefined();
	});
});
