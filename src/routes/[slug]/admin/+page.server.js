import { getEvent } from "$lib/events.server";

export async function load({ fetch, params }) {
    // URL structure is now /[slug]/admin, so we get slug from params.
    const eventSlug = params.slug;

    // We fetch event details.
    const event = await getEvent(eventSlug);

    // Filter images for this event
    const apiEndpoint = eventSlug ? `/api/image-list?event=${eventSlug}` : '/api/image-list';

    const images = await fetch(apiEndpoint);
    const data = await images.json();

    return {
        images: data,
        event: event,
        // Pass slug explicitly if needed by layout or page
        slug: eventSlug
    };
}

export const actions = {
    delete: async ({ request, fetch }) => {
        const data = await request.formData();
        const fullPath = data.get('fullPath');

        if (!fullPath) {
            return { success: false, error: 'Image path is required' };
        }

        try {
            // Encode the full path because it contains slashes
            const encodedPath = encodeURIComponent(fullPath);
            const response = await fetch(`/api/image/${encodedPath}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: 'Failed to delete image' };
            }
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    }
};
