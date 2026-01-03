import { getEvent } from "$lib/events.server";

export async function load({ params }) {
    console.log('Layout load function called for slug:', params.slug);
    const event = await getEvent(params.slug);

    return {
        event,
        slug: params.slug
    };
}
