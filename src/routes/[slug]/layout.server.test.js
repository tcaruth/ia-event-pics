import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+layout.server';
import * as eventsServer from '$lib/events.server';

vi.mock('$lib/events.server', () => ({
	getEvent: vi.fn()
}));

describe('[slug] Layout Server Loader', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads layout event data', async () => {
		const mockEvent = { title: 'Demo Event', slug: 'demo' };
		vi.mocked(eventsServer.getEvent).mockResolvedValue(mockEvent);

		const result = await load({ params: { slug: 'demo' } });

		expect(eventsServer.getEvent).toHaveBeenCalledWith('demo');
		expect(result).toEqual({
			event: mockEvent,
			slug: 'demo'
		});
	});
});
