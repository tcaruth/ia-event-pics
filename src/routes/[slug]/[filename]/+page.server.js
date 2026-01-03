import { getEvent } from '$lib/events.server.js';
import { PUBLIC_BUCKET_READ } from "$env/static/public";

export async function load({ params, url }) {
    // We don't necessarily need to fetch the image metadata if we just construct the URL.
    // We fetch event data to ensure 404 if event doesn't exist? 
    // Or just for context (like colors/fonts if we wanted to style the viewer).
    const event = await getEvent(params.slug);

    return {
        event,
        slug: params.slug,
        filename: params.filename,
        publicBucketRead: PUBLIC_BUCKET_READ
    };
};
