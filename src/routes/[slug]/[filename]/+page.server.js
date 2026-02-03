import { getEvent } from '$lib/events.server.js';


export async function load({ params }) {
    const event = await getEvent(params.slug);
    const image = event?.images?.find(img => img.name === params.filename);

    return {
        event,
        image,
        slug: params.slug,
        filename: params.filename
    };
};
