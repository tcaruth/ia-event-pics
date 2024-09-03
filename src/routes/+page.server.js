import {getEvent} from "$lib/events.server";

export async function load({fetch, url}) {
    const images = await fetch('/api/image-list');
    const data = await images.json();

    return {
        images: data,
        event: getEvent(url),
    };
};