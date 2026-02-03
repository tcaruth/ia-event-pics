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
import os from 'os';
import dns from 'dns';
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { createClient } from '@sanity/client';
import minimist from 'minimist';
import ini from 'ini';
import tinycolor from 'tinycolor2';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

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
let eventSlug = args.event || args.e;
const photoboothName = args.photobooth || args.p;
const configPath = args.config || path.join(os.homedir(), '.config/pibooth/pibooth.cfg');
const baseConfig = path.join(process.cwd(), 'base.cfg');

if (!watchDir || (!eventSlug && !photoboothName)) {
    console.error('Usage: node sanity-uploader.js --dir <directory> [--event <event-slug> | --photobooth <booth-name>] [--config <pibooth-cfg>]');
    process.exit(1);
}

console.log(`Starting watcher on: ${path.resolve(watchDir)}`);

// --- Helper Functions ---

async function getEventDetails(slug) {
    return client.fetch(`*[_type == "event" && slug.current == $slug][0]{
        _id,
        title,
        date,
        location,
        slug,
        colors,
        overlay {
            asset->{
                url
            }
        }
    }`, { slug });
}

async function downloadImage(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download image: ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    console.log(`Downloaded image to ${destPath}`);
}

function hexToRgbTuple(hex) {
    const rgb = tinycolor(hex).toRgb();
    return `(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

async function checkNetwork() {
    return new Promise((resolve) => {
        dns.lookup('2i1qgrlb.api.sanity.io', (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function waitForNetwork() {
    console.log("Checking network connection...");
    while (!(await checkNetwork())) {
        console.log("Network unavailable. Retrying in 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    console.log("Network connected!");
}

async function updatePiboothConfig(baseConfig, configPath, event) {
    try {
        console.log(`Updating Pibooth config at ${configPath}...`);

        let config = {};
        if (fs.existsSync(baseConfig)) {
            config = ini.parse(fs.readFileSync(baseConfig, 'utf-8'));
        }

        // Ensure sections exist
        if (!config.WINDOW) config.WINDOW = {};
        if (!config.PICTURE) config.PICTURE = {};
        if (!config.QRCODE) config.QRCODE = {};
        if (!config.CAMERA) config.CAMERA = {};

        // Sync Colors
        if (event.colors) {
            console.log("Syncing window colors from Sanity...");

            // Window Text -> Surface Text
            if (event.colors.surfaceText) {
                config.WINDOW.text_color = hexToRgbTuple(event.colors.surfaceText);
            }
            // Window Background -> Surface
            if (event.colors.surface) {
                config.WINDOW.background = hexToRgbTuple(event.colors.surface);
            }
        }

        //  ~/Pictures/pibooth/current_overlay.png
        const overlayPath = path.resolve(path.dirname(configPath), 'current_overlay.png');
        if (event.overlay && event.overlay.asset && event.overlay.asset.url) {
            console.log("Downloading overlay...");
            try {
                await downloadImage(event.overlay.asset.url, overlayPath);
                config.PICTURE.overlays = overlayPath;
                console.log(`Setting [PICTURE] overlays = ${overlayPath}`);
            } catch (err) {
                console.error(`Failed to download overlay: ${err.message}`); config.PICTURE.overlays = "";
            }
        } else {
            console.log("No overlay found for event. Disabling overlay.");
            config.PICTURE.overlays = "";
        }

        config.QRCODE.prefix_url = `https://iaevent.pics/${event.slug.current}/{picture}`;

        // config.CAMERA.delete_internal_memory = true

        fs.writeFileSync(configPath, ini.stringify(config));
        console.log('Pibooth config updated successfully.');
    } catch (err) {
        console.error(`Warning: Failed to update pibooth config: ${err.message}`);
    }
}

// --- Initialization Logic ---

let currentEvent = null;

async function initialize() {
    // 1. Wait for Network
    await waitForNetwork();

    // 2. Resolve Slug
    if (!eventSlug && photoboothName) {
        console.log(`Looking up active event for photobooth: "${photoboothName}"...`);
        const booth = await client.fetch(`*[_type == "photobooth" && name == $name][0]{ activeEvent->{slug} }`, { name: photoboothName });

        if (!booth || !booth.activeEvent || !booth.activeEvent.slug) {
            console.error(`Error: Photobooth "${photoboothName}" not found or has no active event.`);
            process.exit(1);
        }
        eventSlug = booth.activeEvent.slug.current;
        console.log(`Resolved Event Slug: ${eventSlug}`);
    } else {
        console.log(`Target Event: ${eventSlug}`);
    }

    // 2. Fetch Event Details
    currentEvent = await getEventDetails(eventSlug);
    if (!currentEvent) {
        console.error(`Error: Event "${eventSlug}" not found in Sanity.`);
        process.exit(1);
    }

    // 3. Update Config
    await updatePiboothConfig(baseConfig, configPath, currentEvent);
}

// Prepare before watching
await initialize();

console.log("Starting Pibooth application...");
const pibooth = spawn('pibooth', [], {
    stdio: 'inherit',
    detached: true,
    cwd: os.homedir() // Good practice to run from home
});
pibooth.unref(); // Allow script to continue and exit independently if needed (though we want to keep watching)
console.log(`Pibooth started (PID: ${pibooth.pid})`);

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

        // 2. Use the already fetched event ID (avoids re-fetching)
        if (!currentEvent || !currentEvent._id) {
            console.error("Error: Current event check failed.");
            return;
        }

        // 3. Append to the gallery array
        await client
            .patch(currentEvent._id)
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
