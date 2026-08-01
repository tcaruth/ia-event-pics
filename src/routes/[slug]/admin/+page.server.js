import { getEvent } from "$lib/events.server";
import { client } from "$lib/sanity";

export async function load({ params }) {
    const event = await getEvent(params.slug, true);
    return {
        images: event?.images || [],
        event: event,
        slug: params.slug
    };
}

export const actions = {
    delete: async ({ request, params }) => {
        const data = await request.formData();
        const key = data.get('fullPath'); // This is the _key from Sanity
        const eventSlug = params.slug;

        if (!key) {
            return { success: false, error: 'Image key is required' };
        }

        try {
            // Find the event document ID
            const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, { slug: eventSlug });

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
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    },
    deleteAll: async ({ params }) => {
        const eventSlug = params.slug;

        try {
            // Find the event document ID
            const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, { slug: eventSlug });

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            // Clear the entire gallery array
            await client
                .patch(event._id)
                .set({ gallery: [] })
                .commit();

            return { success: true, message: 'All photos deleted' };
        } catch (e) {
            console.error('Sanity Delete All Error:', e);
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    },
    print: async ({ request, params }) => {
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
                    "isPhotoboothActive": count(*[_type == "photobooth" && activeEvent->slug.current == $slug]) > 0
                }`,
                { slug: eventSlug }
            );

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            if (!event.isPhotoboothActive) {
                return { success: false, error: 'Printing is only available while the event is active and assigned to a photobooth' };
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
            return { success: false, error: e instanceof Error ? e.message : 'Failed to queue print job' };
        }
    }
};
