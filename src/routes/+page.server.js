import { client } from '$lib/sanity';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const code = data.get('code');

		if (!code) {
			return fail(400, { missing: true });
		}

		// Search for event by slug (used as code)
		const query = `*[_type == "event" && slug.current == $code][0]`;
		const event = await client.fetch(query, { code: decodeURIComponent(code.toString()).trim() });

		if (event) {
			throw redirect(303, `/${event.slug.current}`);
		}

		return fail(400, { invalid: true, code });
	}
};
