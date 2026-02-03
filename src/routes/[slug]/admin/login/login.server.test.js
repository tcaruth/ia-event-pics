import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actions } from './+page.server';
import * as eventsServer from '$lib/events.server';
import { fail, redirect } from '@sveltejs/kit';

// Mock SvelteKit modules
vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn((status, data) => ({ status, data })),
	redirect: vi.fn((status, location) => {
		throw { status, location, type: 'redirect' };
	})
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
	MASTER_ADMIN_PASSWORD: 'master-password'
}));

// Mock events server
vi.mock('$lib/events.server', () => ({
	getEvent: vi.fn(),
	getEventPassword: vi.fn()
}));

describe('Admin Login Action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 if event is not found', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['password', 'any']]))
		};
		const params = { slug: 'non-existent' };

		// Mock getEventPassword to return null
		eventsServer.getEventPassword.mockResolvedValue(null);

		const result = await actions.default({ request, params, cookies: {}, url: {} });

		expect(eventsServer.getEventPassword).toHaveBeenCalledWith('non-existent');
		expect(fail).toHaveBeenCalledWith(400, { error: 'Event not found' });
		expect(result).toEqual({ status: 400, data: { error: 'Event not found' } });
	});

	it('returns 400 on invalid password', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['password', 'wrong-password']]))
		};
		const params = { slug: 'test-event' };
		const cookies = { set: vi.fn() };

		eventsServer.getEventPassword.mockResolvedValue({ adminPassword: 'correct-password' });

		const result = await actions.default({ request, params, cookies, url: {} });

		expect(cookies.set).not.toHaveBeenCalled();
		expect(fail).toHaveBeenCalledWith(400, { error: 'Invalid password' });
	});

	it('logs in with correct event password', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['password', 'correct-password']]))
		};
		const params = { slug: 'test-event' };
		const cookies = { set: vi.fn() };
		const url = { search: '?foo=bar' };

		eventsServer.getEventPassword.mockResolvedValue({ adminPassword: 'correct-password' });

		try {
			await actions.default({ request, params, cookies, url });
			expect.unreachable('Should have thrown redirect');
		} catch (e) {
			expect(e).toEqual({ status: 303, location: '/test-event/admin?foo=bar', type: 'redirect' });
		}

		expect(cookies.set).toHaveBeenCalledWith(
			'session',
			'admin',
			expect.objectContaining({
				path: '/',
				httpOnly: true,
				maxAge: 60 * 60 * 24
			})
		);
	});

	it('logs in with master password', async () => {
		const request = {
			formData: vi.fn().mockResolvedValue(new Map([['password', 'master-password']]))
		};
		const params = { slug: 'test-event' };
		const cookies = { set: vi.fn() };
		const url = { search: '' };

		// Even if event has a different password
		eventsServer.getEventPassword.mockResolvedValue({ adminPassword: 'other-password' });

		try {
			await actions.default({ request, params, cookies, url });
			expect.unreachable('Should have thrown redirect');
		} catch (e) {
			expect(e).toEqual({ status: 303, location: '/test-event/admin', type: 'redirect' });
		}

		expect(cookies.set).toHaveBeenCalled();
	});
});
