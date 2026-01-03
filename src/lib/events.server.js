import { client } from './sanity';
import groq from 'groq';

/**
 * @param {string} slug
 */
async function getEvent(slug) {
    if (!slug) {
        return null;
    }

    const query = groq`*[_type == "event" && slug.current == $slug][0]{
        title,
        "name": title,
        date,
        location,
        "primary_image": primaryImage.asset->url,
        adminPassword,
        fonts,
        colors,
        "images": gallery[]{
            "url": asset->url,
            "created": coalesce(created, _createdAt), 
            "key": _key,
            "name": asset->originalFilename,
            "id": asset->_id,
            "metadata": asset->metadata,
            "fullPath": _key
        }
    }`;

    try {
        const event = await client.fetch(query, { slug: slug });
        return event;
    } catch (error) {
        console.error('Error fetching event from Sanity:', error);
        return null;
    }
}

export { getEvent };
