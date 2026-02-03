import { client } from '$lib/sanity';
import groq from 'groq';

export async function GET({ url: requestUrl }) {
	console.log('GET /api/image-list called');
	const eventSlug = requestUrl.searchParams.get('event');

	if (!eventSlug) {
		return new Response(JSON.stringify({ error: 'Event slug is required' }), { status: 400 });
	}

	try {
		const query = groq`*[_type == "event" && slug.current == $slug][0]{
            gallery[]{
                "url": asset->url,
                "name": asset->originalFilename,
                "created": coalesce(created, _createdAt),
                "id": asset->_id,
                "key": _key
            }
        }`;

		/** @type {{gallery: import('$lib/events.server').EventImage[]}} */
		const data = await client.fetch(query, { slug: eventSlug });

		if (!data || !data.gallery) {
			return new Response(JSON.stringify([]));
		}

		const urls = data.gallery.map((image) => ({
			name: image.name,
			fullPath: image.key, // Using key as fullPath for legacy compatibility
			url: image.url,
			created: image.created
		}));

		// Sort by created date (or key if that's all we have)
		// Note: Sanity keys are not necessarily date strings, but we can't easily sort without a real date.
		// If we had a 'created' field in the array items, we'd use that.

		return new Response(JSON.stringify(urls));
	} catch (e) {
		const error = /** @type {Error} */ (e);
		console.error('Sanity fetch error in image-list:', error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}
