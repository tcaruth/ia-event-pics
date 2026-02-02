import { getEvent } from '$lib/events.server';
import { MASTER_ADMIN_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';

console.log('login server page');

export const actions = {
	default: async ({ request, cookies, url, params }) => {
		const data = await request.formData();
		const password = data.get('password');
		const eventSlug = params.slug;
		const event = await getEvent(eventSlug);

		if (!event) {
			return fail(400, { error: 'Event not found' });
		}

		if (
			(event.adminPassword && password === event.adminPassword) ||
			password === MASTER_ADMIN_PASSWORD
		) {
			cookies.set('session', 'admin', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 1 day
			});
			throw redirect(303, `/${eventSlug}/admin${url.search}`);
		}

		return fail(400, { error: 'Invalid password' });
	}
};
