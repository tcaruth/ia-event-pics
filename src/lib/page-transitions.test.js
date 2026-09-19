import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preparePageTransition } from './page-transitions';
import * as navigation from '$app/navigation';

vi.mock('$app/navigation', () => ({
	onNavigate: vi.fn()
}));

describe('page-transitions.js', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('registers an onNavigate callback', () => {
		preparePageTransition();
		expect(navigation.onNavigate).toHaveBeenCalledTimes(1);
	});

	it('does nothing if document.startViewTransition is not defined', async () => {
		preparePageTransition();
		const callback = vi.mocked(navigation.onNavigate).mock.calls[0][0];

		// @ts-ignore
		delete globalThis.document;
		// @ts-ignore
		globalThis.document = {};

		const nav = {
			from: { url: new URL('http://localhost/demo') },
			to: { url: new URL('http://localhost/demo/img1.jpg') },
			complete: Promise.resolve()
		};

		// @ts-ignore
		const result = callback(nav);
		expect(result).toBeUndefined();
	});

	it('skips transition if navigating to the exact same URL', async () => {
		preparePageTransition();
		const callback = vi.mocked(navigation.onNavigate).mock.calls[0][0];

		const startViewTransition = vi.fn();
		// @ts-ignore
		globalThis.document = { startViewTransition };

		const nav = {
			from: { url: new URL('http://localhost/demo') },
			to: { url: new URL('http://localhost/demo') },
			complete: Promise.resolve()
		};

		// @ts-ignore
		const result = callback(nav);
		expect(result).toBeUndefined();
		expect(startViewTransition).not.toHaveBeenCalled();
	});

	it('starts view transition and awaits navigation.complete on route change', async () => {
		preparePageTransition();
		const callback = vi.mocked(navigation.onNavigate).mock.calls[0][0];

		let transitionCallback;
		const startViewTransition = vi.fn((cb) => {
			transitionCallback = cb;
		});
		// @ts-ignore
		globalThis.document = { startViewTransition };

		let completeResolved = false;
		/** @type {Promise<void>} */
		const completePromise = new Promise((resolve) => {
			setTimeout(() => {
				completeResolved = true;
				resolve();
			}, 10);
		});

		const nav = {
			from: { url: new URL('http://localhost/demo') },
			to: { url: new URL('http://localhost/demo/img1.jpg') },
			complete: completePromise
		};

		// @ts-ignore
		const transitionPromise = callback(nav);
		expect(transitionPromise).toBeInstanceOf(Promise);
		expect(startViewTransition).toHaveBeenCalledTimes(1);

		// Execute transition callback
		expect(transitionCallback).toBeDefined();
		const cbPromise = (/** @type {any} */ (transitionCallback))();

		await transitionPromise;
		await cbPromise;
		expect(completeResolved).toBe(true);
	});
});
