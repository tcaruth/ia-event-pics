import { getEvent } from "$lib/events.server";

export async function load({ fetch, params }) {
    console.log('Page load function called for slug:', params.slug);
    try {
        const images = await fetch(`/api/image-list?event=${params.slug}`);
        console.log('Fetch response status:', images.status);
        const data = await images.json();
        console.log('Data received:', data?.length || 'empty');
        return {
            images: data,
            event: await getEvent(params.slug),
            slug: params.slug
        };
    } catch (e) {
        console.error('Error in page load:', e);
        return {
            images: [],
            event: await getEvent(params.slug),
            slug: params.slug
        };
    }
};
