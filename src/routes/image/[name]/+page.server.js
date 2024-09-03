import { getEvent } from 'lib/events.server.js';

export async function load({params, url}) {
    const event = getEvent(url);

    return {event};
};