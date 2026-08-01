import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import { client } from '$lib/sanity';
import { fail, redirect } from '@sveltejs/kit';

vi.mock('$lib/sanity', () => ({
	client: {
		fetch: vi.fn()
	}
}));

vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn((status, data) => ({ status, data })),
	redirect: vi.fn((status, location) => {
		throw { status, location, type: 'redirect' };
	})
}));

describe('Root Page Form Action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 with missing:true when no code is submitted', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map())
		};

		const result = await (/** @type {any} */ (actions.default))({ request });

		expect(fail).toHaveBeenCalledWith(400, { missing: true });
		expect(result).toEqual({ status: 400, data: { missing: true } });
	});

	it('redirects to event slug when event exists', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['code', 'DEMO']]))
		};

		vi.mocked(client.fetch).mockResolvedValue({
			slug: { current: 'demo' }
		});

		try {
			await (/** @type {any} */ (actions.default))({ request });
			expect.unreachable('Should have thrown redirect');
		} catch (e) {
			expect(e).toEqual({ status: 303, location: '/demo', type: 'redirect' });
		}

		expect(client.fetch).toHaveBeenCalledWith(
			expect.stringContaining('slug.current == $code'),
			{ code: 'DEMO' }
		);
	});

	it('returns 400 with invalid:true when event is not found', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['code', 'NON-EXISTENT']]))
		};

		vi.mocked(client.fetch).mockResolvedValue(null);

		const result = await (/** @type {any} */ (actions.default))({ request });

		expect(fail).toHaveBeenCalledWith(400, { invalid: true, code: 'NON-EXISTENT' });
		expect(result).toEqual({ status: 400, data: { invalid: true, code: 'NON-EXISTENT' } });
	});
});
