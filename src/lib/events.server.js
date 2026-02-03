import { client } from './sanity';
import groq from 'groq';

/**
 * @typedef {Object} ImageMetadata
 * @property {string} [lqip]
 * @property {Object} [dimensions]
 * @property {number} [dimensions.width]
 * @property {number} [dimensions.height]
 * @property {number} [dimensions.aspectRatio]
 */

/**
 * @typedef {Object} EventImage
 * @property {string} url
 * @property {string} created
 * @property {string} key
 * @property {string} name
 * @property {string} id
 * @property {ImageMetadata} [metadata]
 * @property {string} fullPath
 * @property {string} [alt]
 */

/**
 * @typedef {Object} EventColors
 * @property {string} [primary]
 * @property {string} [primaryText]
 * @property {string} [secondary]
 * @property {string} [secondaryText]
 * @property {string} [surface]
 * @property {string} [surfaceText]
 */

/**
 * @typedef {Object} EventFonts
 * @property {string} [heading]
 * @property {string} [body]
 */

/**
 * @typedef {Object} EventData
 * @property {string} title
 * @property {string} name
 * @property {string} [date]
 * @property {string} [location]
 * @property {string} [primary_image]
 * @property {string} [adminPassword]
 * @property {EventFonts} [fonts]
 * @property {EventColors} [colors]
 * @property {EventImage[]} images
 * @property {string} [description]
 * @property {string} [theme]
 */

/**
 * @param {string} slug
 * @param {boolean} [showAllImages=false]
 * @returns {Promise<EventData | null>}
 */
async function getEvent(slug, showAllImages = false) {
    if (!slug) {
        return null;
    }

    const query = groq`*[_type == "event" && slug.current == $slug][0]{
        title,
        description,
        "name": title,
        date,
        location,
        "primary_image": primaryImage.asset->url,
        adminPassword,
        fonts,
        colors,
        theme,
        "images": gallery[$showAllImages == true || !defined(asset->originalFilename) || !(asset->originalFilename match "*pibooth*")]{
            "url": asset->url,
            "created": coalesce(created, _createdAt), 
            "key": _key,
            "name": asset->originalFilename,
            "id": asset->_id,
            "metadata": asset->metadata,
            "fullPath": _key,
            "alt": alt
        }
    }`;

    try {
        const event = await client.fetch(query, { slug: slug, showAllImages: showAllImages });

        return event;
    } catch (error) {
        console.error('Error fetching event from Sanity:', error);
        return null;
    }
}

/**
 * @param {string} slug
 * @returns {Promise<{ adminPassword?: string } | null>}
 */
async function getEventPassword(slug) {
    if (!slug) {
        return null;
    }

    const query = groq`*[_type == "event" && slug.current == $slug][0]{
        adminPassword
    }`;

    try {
        return await client.fetch(query, { slug: slug });
    } catch (error) {
        console.error('Error fetching event password from Sanity:', error);
        return null;
    }
}

export { getEvent, getEventPassword };
