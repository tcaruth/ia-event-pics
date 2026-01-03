import { getEvent } from "$lib/events.server";

export async function load({ params }) {
    console.log('Page load function called for slug:', params.slug);
    const event = await getEvent(params.slug);

    return {
        images: event?.images || [],
        event: event,
        slug: params.slug
    };
};
