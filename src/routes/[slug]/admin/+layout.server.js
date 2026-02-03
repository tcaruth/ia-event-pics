import { redirect } from '@sveltejs/kit';

export function load({ cookies, url, params }) {
	const session = cookies.get('session');

	// Check if we are already at the login page to avoid infinite redirect loop
	// URL would be /[slug]/admin/login
	const loginPath = `/${params.slug}/admin/login`;

	if (!session && url.pathname !== loginPath) {
		throw redirect(303, `${loginPath}${url.search}`);
	}
}
