import { getEvent } from '$lib/events.server';
import { client } from '$lib/sanity';
import { isEventEnded } from '$lib/analytics';

export async function load({ params, cookies }) {
	const event = await getEvent(params.slug, true);
	const session = cookies?.get ? cookies.get('session') : null;
	const isMaster = session === 'master';
	return {
		images: event?.images || [],
		event: event,
		slug: params.slug,
		isMaster
	};
}

export const actions = {
	deleteBatch: async ({ request, params }) => {
		const data = await request.formData();
		const keysData = data.get('keys');
		let keys = [];
		if (typeof keysData === 'string') {
			try {
				const parsed = JSON.parse(keysData);
				if (Array.isArray(parsed)) keys = parsed;
			} catch {
				keys =
					typeof data.getAll === 'function'
						? data.getAll('keys').map((k) => String(k))
						: [keysData];
			}
		} else if (typeof data.getAll === 'function') {
			keys = data.getAll('keys').map((k) => String(k));
		}

		keys = keys.filter(Boolean);

		if (keys.length === 0) {
			return { success: false, error: 'At least one photo must be selected for deletion.' };
		}

		const eventSlug = params.slug;

		try {
			const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, {
				slug: eventSlug
			});

			if (!event) {
				return { success: false, error: 'Event not found' };
			}

			const CHUNK_SIZE = 50;
			for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
				const chunk = keys.slice(i, i + CHUNK_SIZE);
				const unsetPaths = chunk.map((key) => `gallery[_key=="${key}"]`);
				await client.patch(event._id).unset(unsetPaths).commit();
			}

			return {
				success: true,
				deletedCount: keys.length,
				message: `Successfully deleted ${keys.length} photo${keys.length === 1 ? '' : 's'}.`
			};
		} catch (e) {
			console.error('Sanity Batch Delete Error:', e);
			return {
				success: false,
				error: e instanceof Error ? e.message : 'An unknown error occurred'
			};
		}
	},
	delete: async ({ request, params }) => {
		const data = await request.formData();
		const key = data.get('fullPath'); // This is the _key from Sanity
		const eventSlug = params.slug;

		if (!key) {
			return { success: false, error: 'Image key is required' };
		}

		try {
			// Find the event document ID
			const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, {
				slug: eventSlug
			});

			if (!event) {
				return { success: false, error: 'Event not found' };
			}

			// Remove the image from the gallery array using its _key
			await client
				.patch(event._id)
				.unset([`gallery[_key=="${key}"]`])
				.commit();

			return { success: true };
		} catch (e) {
			console.error('Sanity Delete Error:', e);
			return {
				success: false,
				error: e instanceof Error ? e.message : 'An unknown error occurred'
			};
		}
	},
	deleteAll: async ({ params }) => {
		const eventSlug = params.slug;

		try {
			// Find the event document ID
			const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, {
				slug: eventSlug
			});

			if (!event) {
				return { success: false, error: 'Event not found' };
			}

			// Clear the entire gallery array
			await client.patch(event._id).set({ gallery: [] }).commit();

			return { success: true, message: 'All photos deleted' };
		} catch (e) {
			console.error('Sanity Delete All Error:', e);
			return {
				success: false,
				error: e instanceof Error ? e.message : 'An unknown error occurred'
			};
		}
	},
	print: async ({ request, params, cookies }) => {
		const data = await request.formData();
		const key = data.get('fullPath');
		const assetUrl = data.get('assetUrl');
		const imageName = data.get('imageName');
		const eventSlug = params.slug;

		if (!key || !assetUrl) {
			return { success: false, error: 'Image details are required for printing' };
		}

		try {
			const event = await client.fetch(
				`*[_type == "event" && slug.current == $slug][0]{
                    _id,
                    "isPhotoboothActive": count(*[_type == "photobooth" && activeEvent->slug.current == $slug]) > 0,
                    "gallery": gallery[]{
                        "key": _key,
                        "url": asset->url,
                        "name": asset->originalFilename,
                        "created": coalesce(created, _createdAt)
                    }
                }`,
				{ slug: eventSlug }
			);

			if (!event) {
				return { success: false, error: 'Event not found' };
			}

			if (!event.isPhotoboothActive) {
				return {
					success: false,
					error: 'Printing is only available while the event is active and assigned to a photobooth'
				};
			}

			const session = cookies?.get ? cookies.get('session') : null;
			const isMaster = session === 'master';
			if (isEventEnded(event.gallery) && !isMaster) {
				return {
					success: false,
					error:
						'Printing is restricted to master administrators more than 24 hours after the last photo'
				};
			}

			const printTask = {
				_key: `print_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
				imageKey: String(key),
				assetUrl: String(assetUrl),
				imageName: String(imageName || ''),
				status: 'pending',
				requestedAt: new Date().toISOString()
			};

			await client
				.patch(event._id)
				.setIfMissing({ printQueue: [] })
				.append('printQueue', [printTask])
				.commit();

			return { success: true, message: `Print job queued for ${imageName || 'photo'}` };
		} catch (e) {
			console.error('Sanity Print Queue Error:', e);
			return {
				success: false,
				error: e instanceof Error ? e.message : 'Failed to queue print job'
			};
		}
	},
	printBatch: async ({ request, params, cookies }) => {
		const data = await request.formData();
		const imagesData = data.get('images');
		const keysData = data.get('keys');
		const eventSlug = params.slug;

		let items = [];
		if (typeof imagesData === 'string') {
			try {
				const parsed = JSON.parse(imagesData);
				if (Array.isArray(parsed)) items = parsed;
			} catch (e) {
				console.error('Error parsing images JSON:', e);
			}
		}

		if (items.length === 0 && typeof keysData === 'string') {
			try {
				const parsedKeys = JSON.parse(keysData);
				if (Array.isArray(parsedKeys)) {
					items = parsedKeys.map((k) => ({ fullPath: String(k) }));
				}
			} catch (e) {
				console.error('Error parsing keys JSON:', e);
			}
		}

		if (items.length === 0) {
			return { success: false, error: 'At least one photo must be selected for printing.' };
		}

		try {
			const event = await client.fetch(
				`*[_type == "event" && slug.current == $slug][0]{
                    _id,
                    "isPhotoboothActive": count(*[_type == "photobooth" && activeEvent->slug.current == $slug]) > 0,
                    "gallery": gallery[]{
                        "key": _key,
                        "url": asset->url,
                        "name": asset->originalFilename,
                        "created": coalesce(created, _createdAt)
                    }
                }`,
				{ slug: eventSlug }
			);

			if (!event) {
				return { success: false, error: 'Event not found' };
			}

			if (!event.isPhotoboothActive) {
				return {
					success: false,
					error: 'Printing is only available while the event is active and assigned to a photobooth'
				};
			}

			const session = cookies?.get ? cookies.get('session') : null;
			const isMaster = session === 'master';
			if (isEventEnded(event.gallery) && !isMaster) {
				return {
					success: false,
					error:
						'Printing is restricted to master administrators more than 24 hours after the last photo'
				};
			}

			const galleryMap = new Map((event.gallery || []).map((/** @type {any} */ g) => [g.key, g]));

			const printTasks = [];
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const key = item.fullPath || item.key || item.imageKey;
				const galleryItem = key ? galleryMap.get(key) : null;
				const assetUrl = item.assetUrl || item.url || galleryItem?.url;
				const imageName = item.imageName || item.name || galleryItem?.name || '';

				if (key && assetUrl) {
					printTasks.push({
						_key: `print_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
						imageKey: String(key),
						assetUrl: String(assetUrl),
						imageName: String(imageName),
						status: 'pending',
						requestedAt: new Date().toISOString()
					});
				}
			}

			if (printTasks.length === 0) {
				return { success: false, error: 'No valid photos found to print.' };
			}

			const CHUNK_SIZE = 50;
			for (let i = 0; i < printTasks.length; i += CHUNK_SIZE) {
				const chunk = printTasks.slice(i, i + CHUNK_SIZE);
				await client
					.patch(event._id)
					.setIfMissing({ printQueue: [] })
					.append('printQueue', chunk)
					.commit();
			}

			return {
				success: true,
				message: `Queued ${printTasks.length} photo${printTasks.length === 1 ? '' : 's'} for printing.`
			};
		} catch (e) {
			console.error('Sanity Print Batch Error:', e);
			return {
				success: false,
				error: e instanceof Error ? e.message : 'Failed to queue print jobs'
			};
		}
	}
};
