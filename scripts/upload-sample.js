import { createClient } from '@sanity/client';
import path from 'path';
import { fileURLToPath } from 'url';

const {
    VITE_SANITY_PROJECT_ID,
    VITE_SANITY_DATASET,
    SANITY_API_TOKEN
} = process.env;

const client = createClient({
    projectId: VITE_SANITY_PROJECT_ID,
    dataset: VITE_SANITY_DATASET,
    token: SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function uploadFromUrl(imageUrl, filename, slug) {
    console.log(`Fetching ${imageUrl}...`);
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    console.log(`Uploading ${filename} as asset...`);
    const asset = await client.assets.upload('image', buffer, {
        filename: filename
    });

    console.log(`Asset uploaded: ${asset._id}. Appending to event ${slug}...`);

    // Find the event
    const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]`, { slug });

    if (!event) {
        console.error(`Event ${slug} not found!`);
        return;
    }

    // Append to gallery
    await client
        .patch(event._id)
        .setIfMissing({ gallery: [] })
        .append('gallery', [
            {
                _type: 'image',
                _key: Math.random().toString(36).substring(2, 9),
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                },
                created: new Date().toISOString()
            }
        ])
        .commit();

    console.log(`Successfully added ${filename} to ${slug}`);
}

async function main() {
    const slug = 'aubri-and-travis';
    const stockImages = [
        { url: 'https://picsum.photos/1200/800', name: 'stock-1.jpg' },
        { url: 'https://picsum.photos/1200/801', name: 'stock-2.jpg' },
        { url: 'https://picsum.photos/1200/802', name: 'stock-3.jpg' },
        { url: 'https://picsum.photos/1200/803', name: 'stock-4.jpg' },
        { url: 'https://picsum.photos/1200/804', name: 'stock-5.jpg' }
    ];

    for (const img of stockImages) {
        try {
            await uploadFromUrl(img.url, img.name, slug);
        } catch (error) {
            console.error(`Failed to upload ${img.name}:`, error.message);
        }
    }
}

main().catch(console.error);
