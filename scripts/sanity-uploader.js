/**
 * Sanity Image Uploader Script
 * 
 * This script watches a specified directory for new image files and
 * uploads them directly to a Sanity.io dataset, associating them with
 * a specific event document.
 * 
 * usage: node sanity-uploader.js --dir ./photos --event my-wedding-slug
 */

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { createClient } from '@sanity/client';
import minimist from 'minimist';

// Configuration from environment variables
const {
    SANITY_PROJECT_ID,
    SANITY_DATASET,
    SANITY_API_TOKEN, // Requires write permissions
} = process.env;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
    console.error('Error: SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN must be set in .env');
    process.exit(1);
}

const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03',
});

// Parse CLI arguments
const args = minimist(process.argv.slice(2));
const watchDir = args.dir || args.d;
const eventSlug = args.event || args.e;

if (!watchDir || !eventSlug) {
    console.error('Usage: node sanity-uploader.js --dir <directory> --event <event-slug>');
    process.exit(1);
}

console.log(`Starting watcher on: ${path.resolve(watchDir)}`);
console.log(`Target Event: ${eventSlug}`);

// Watch for NEW files
const watcher = chokidar.watch(watchDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't upload existing files on start
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    }
});

watcher.on('add', async (filePath) => {
    const fileName = path.basename(filePath);

    // Basic image check
    if (!/\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
        return;
    }

    console.log(`New file detected: ${fileName}. Uploading...`);

    try {
        // 1. Upload the image asset
        const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
            filename: fileName
        });

        console.log(`Asset uploaded: ${asset._id}. Finding event...`);

        // 2. Find the event document
        const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]`, { slug: eventSlug });

        if (!event) {
            console.error(`Error: Event with slug "${eventSlug}" not found!`);
            return;
        }

        // 3. Append to the gallery array
        await client
            .patch(event._id)
            .setIfMissing({ gallery: [] })
            .append('gallery', [
                {
                    _type: 'image',
                    _key: Math.random().toString(36).substring(2, 9), // Simple unique key
                    asset: {
                        _type: 'reference',
                        _ref: asset._id
                    },
                    created: new Date().toISOString()
                }
            ])
            .commit();

        console.log(`Successfully added ${fileName} to event "${eventSlug}"`);
    } catch (error) {
        console.error(`Failed to upload ${fileName}:`, error.message);
    }
});

process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
});
