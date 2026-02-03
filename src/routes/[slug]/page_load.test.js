import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server.js';
import * as eventsServer from '$lib/events.server';

// Mock the module (though we verify it's NOT called)
vi.mock('$lib/events.server', () => ({
	getEvent: vi.fn()
}));

describe('Page Load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should use data from parent layout and NOT fetch event again', async () => {
		const mockEvent = { images: [], title: 'Test Event from Parent' };
		// We do NOT set up eventsServer.getEvent.mockResolvedValue because it shouldn't be called.

		const params = { slug: 'test-slug' };
		const parent = vi.fn().mockResolvedValue({ event: mockEvent });

		const result = await load({ params, parent });

		expect(eventsServer.getEvent).not.toHaveBeenCalled();
		expect(parent).toHaveBeenCalled();
		expect(result.event).toBe(mockEvent);
	});
});
