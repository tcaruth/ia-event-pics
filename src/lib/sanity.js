import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { SANITY_API_TOKEN } from '$env/static/private';

export const client = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    token: SANITY_API_TOKEN,
    useCdn: false, // `false` if you want to ensure fresh data
    apiVersion: '2023-05-03',
})

const builder = createImageUrlBuilder(client)

/**
 * @param {any} source
 */
export function urlFor(source) {
    return builder.image(source)
}
