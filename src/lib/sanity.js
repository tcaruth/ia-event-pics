import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    dataset: import.meta.env.VITE_SANITY_DATASET,
    useCdn: false, // `false` if you want to ensure fresh data
    apiVersion: '2023-05-03',
})

const builder = createImageUrlBuilder(client)

export function urlFor(source) {
    return builder.image(source)
}
