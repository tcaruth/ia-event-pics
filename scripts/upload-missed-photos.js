#!/usr/bin/env node

/**
 * Upload Missed Photos to Sanity
 *
 * Scans the photobooth directory (defaults to ~/Pictures/pibooth) for any photos
 * that failed to upload during an offline period, preserves original capture
 * timestamps (mtime), checks against Sanity to avoid duplicates, and appends
 * them to the active event's gallery.
 *
 * Usage:
 *   node upload-missed-photos.js [--dir <path>] [--event <slug>] [--photobooth <name>] [--dry-run] [--force]
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { createClient } from '@sanity/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env file manually if dotenv is not available
function loadEnv() {
    const candidates = [
        path.join(process.cwd(), '.env'),
        path.join(__dirname, '.env'),
        '/home/pi/sanity-controller/.env'
    ];

    for (const envPath of candidates) {
        if (fs.existsSync(envPath)) {
            try {
                const content = fs.readFileSync(envPath, 'utf-8');
                content.split('\n').forEach((line) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#')) return;
                    const eqIndex = trimmed.indexOf('=');
                    if (eqIndex > 0) {
                        const key = trimmed.slice(0, eqIndex).trim();
                        let val = trimmed.slice(eqIndex + 1).trim();
                        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.slice(1, -1);
                        }
                        if (!process.env[key]) {
                            process.env[key] = val;
                        }
                    }
                });
                console.log(`Loaded environment from ${envPath}`);
                return;
            } catch (err) {
                console.warn(`Could not parse ${envPath}: ${err.message}`);
            }
        }
    }
}

loadEnv();

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
    console.error('Error: SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN must be set in .env');
    process.exit(1);
}

const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03'
});

// Parse CLI arguments
const args = minimist(process.argv.slice(2));
const rawDir = args.dir || args.d || '~/Pictures/pibooth';
const targetDir = rawDir.startsWith('~') ? path.join(os.homedir(), rawDir.slice(1)) : path.resolve(rawDir);
let eventSlug = args.event || args.e;
const photoboothName = args.photobooth || args.p || 'Moose';
const isDryRun = Boolean(args['dry-run'] || args.n);
const isForce = Boolean(args.force || args.f);
const isAllHistory = Boolean(args['all-history']);
const sinceArg = args.since || args.s;

// Recursive scanner for image files
function findImages(dir) {
    let results = [];
    if (!fs.existsSync(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name.startsWith('.')) continue; // skip hidden files

        if (entry.isDirectory()) {
            results = results.concat(findImages(fullPath));
        } else if (entry.isFile()) {
            if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
                try {
                    const stat = fs.statSync(fullPath);
                    // Compute SHA-1 for duplicate detection
                    const buffer = fs.readFileSync(fullPath);
                    const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

                    let mtime = stat.mtime;
                    if (!mtime || isNaN(mtime.getTime()) || mtime.getTime() === 0) {
                        const dateMatch = entry.name.match(/(\d{4})-(\d{2})-(\d{2})[-_](\d{2})[-_](\d{2})[-_](\d{2})/);
                        if (dateMatch) {
                            const [, yr, mo, da, hr, mi, se] = dateMatch;
                            mtime = new Date(`${yr}-${mo}-${da}T${hr}:${mi}:${se}`);
                        } else {
                            mtime = stat.birthtime || new Date();
                        }
                    }

                    results.push({
                        filePath: fullPath,
                        fileName: entry.name,
                        size: stat.size,
                        mtime: mtime,
                        createdIso: mtime.toISOString(),
                        sha1
                    });
                } catch (e) {
                    console.warn(`Could not read ${fullPath}: ${e.message}`);
                }
            }
        }
    }
    return results;
}

// Format bytes
function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    console.log('====================================================');
    console.log('       Sanity Missed Photos Recovery Script         ');
    console.log('====================================================');
    if (isDryRun) {
        console.log('[MODE] DRY RUN (No changes will be written to Sanity)');
    }
    if (isForce) {
        console.log('[MODE] FORCE (Duplicate checks bypassed)');
    }

    // 1. Resolve Event
    let eventDoc = null;
    if (eventSlug) {
        console.log(`Looking up event by slug: "${eventSlug}"...`);
        eventDoc = await client.fetch(
            `*[_type == "event" && slug.current == $slug][0]{
                _id,
                title,
                "slug": slug.current,
                "gallery": gallery[]{
                    _key,
                    created,
                    "filename": asset->originalFilename,
                    "sha1": asset->sha1hash
                }
            }`,
            { slug: eventSlug }
        );
    } else {
        console.log(`Looking up active event for photobooth: "${photoboothName}"...`);
        const booth = await client.fetch(
            `*[_type == "photobooth" && name == $name][0]{
                activeEvent->{
                    _id,
                    title,
                    "slug": slug.current,
                    "gallery": gallery[]{
                        _key,
                        created,
                        "filename": asset->originalFilename,
                        "sha1": asset->sha1hash
                    }
                }
            }`,
            { name: photoboothName }
        );

        if (!booth || !booth.activeEvent) {
            console.error(`Error: Photobooth "${photoboothName}" not found or has no active event.`);
            console.error('Tip: You can pass --event <slug> explicitly to specify the event.');
            process.exit(1);
        }
        eventDoc = booth.activeEvent;
    }

    if (!eventDoc || !eventDoc._id) {
        console.error(`Error: Event not found.`);
        process.exit(1);
    }

    // Also fetch event's date and creation timestamp
    const fullEventMeta = await client.fetch(
        `*[_type == "event" && _id == $id][0]{ date, _createdAt }`,
        { id: eventDoc._id }
    );
    eventDoc.date = fullEventMeta?.date;
    eventDoc._createdAt = fullEventMeta?._createdAt;

    console.log(`Target Event: "${eventDoc.title}" (${eventDoc.slug})`);
    console.log(`Event ID:     ${eventDoc._id}`);
    if (eventDoc.date) console.log(`Event Date:   ${eventDoc.date}`);
    console.log(`Created At:   ${eventDoc._createdAt}`);

    const existingGallery = eventDoc.gallery || [];
    console.log(`Current Sanity Gallery Count for this Event: ${existingGallery.length}`);

    // Build sets of ALL existing assets in Sanity across ALL events
    console.log('Fetching existing assets across Sanity to prevent re-uploading old event photos...');
    const allEventsAssets = await client.fetch(
        `*[_type == "event"].gallery[]{
            "filename": asset->originalFilename,
            "sha1": asset->sha1hash
        }`
    );

    const existingSha1s = new Set();
    const existingFilenames = new Set();
    for (const item of allEventsAssets || []) {
        if (item.sha1) existingSha1s.add(item.sha1.toLowerCase());
        if (item.filename) existingFilenames.add(item.filename);
    }
    console.log(`Indexed ${existingSha1s.size} unique existing assets across Sanity.`);

    // 2. Scan Local Directory
    console.log(`Scanning directory: ${targetDir}...`);
    if (!fs.existsSync(targetDir)) {
        console.error(`Error: Directory does not exist: ${targetDir}`);
        process.exit(1);
    }

    const localImages = findImages(targetDir);
    console.log(`Found ${localImages.length} local image(s).`);

    if (localImages.length === 0) {
        console.log('No local images found. Nothing to upload.');
        return;
    }

    // Sort chronologically by mtime so earlier captures are uploaded first
    localImages.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());

    // Determine since date filter to isolate this event from past events
    let sinceDate = null;
    if (sinceArg) {
        sinceDate = new Date(sinceArg);
        console.log(`Filtering photos captured since: ${sinceDate.toISOString()} (--since argument)`);
    } else if (!isAllHistory && eventDoc._createdAt) {
        // Default to 48 hours before event document creation to cover setup/test shots without picking up past events
        const eventCreated = new Date(eventDoc._createdAt);
        sinceDate = new Date(eventCreated.getTime() - 48 * 3600 * 1000);
        console.log(`Filtering photos captured since: ${sinceDate.toISOString()} (auto-derived from event creation date)`);
        console.log('Tip: Pass --all-history to include all files or --since <date> for a custom date range.');
    }

    const eligibleImages = sinceDate
        ? localImages.filter((img) => img.mtime.getTime() >= sinceDate.getTime())
        : localImages;

    console.log(`Eligible images for this event: ${eligibleImages.length} (out of ${localImages.length} total local files).`);

    // 3. Classify into already uploaded vs missing
    const toUpload = [];
    const alreadyUploaded = [];

    for (const img of eligibleImages) {
        const isDuplicateSha1 = existingSha1s.has(img.sha1.toLowerCase());
        // For composite photos (starts with date timestamp), also check filename
        const isDuplicateFilename = existingFilenames.has(img.fileName);

        if (!isForce && (isDuplicateSha1 || (img.fileName.includes('_pibooth') && isDuplicateFilename))) {
            alreadyUploaded.push(img);
        } else {
            toUpload.push(img);
        }
    }

    console.log(`Already in Sanity:  ${alreadyUploaded.length}`);
    console.log(`Pending upload:     ${toUpload.length}`);

    if (toUpload.length === 0) {
        console.log('\nAll local images are already uploaded to Sanity! Everything is in sync.');
        return;
    }

    console.log('\n--- Images to Upload ---');
    toUpload.forEach((img, idx) => {
        console.log(
            `  ${String(idx + 1).padStart(3, ' ')}. ${img.fileName} (${formatBytes(img.size)}) — Captured: ${img.createdIso}`
        );
    });

    if (isDryRun) {
        console.log('\n[DRY RUN COMPLETE] Rerun without --dry-run to upload these files.');
        return;
    }

    console.log('\nStarting upload...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < toUpload.length; i++) {
        const img = toUpload[i];
        const progress = `[${i + 1}/${toUpload.length}]`;
        process.stdout.write(`${progress} Uploading ${img.fileName} (${formatBytes(img.size)})... `);

        let uploaded = false;
        let lastError = null;

        // Retry up to 3 times on network glitch
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                // 1. Upload asset
                const asset = await client.assets.upload('image', fs.createReadStream(img.filePath), {
                    filename: img.fileName
                });

                // 2. Append to gallery preserving the local file's modification timestamp
                await client
                    .patch(eventDoc._id)
                    .setIfMissing({ gallery: [] })
                    .append('gallery', [
                        {
                            _type: 'image',
                            _key: Math.random().toString(36).substring(2, 9),
                            asset: {
                                _type: 'reference',
                                _ref: asset._id
                            },
                            // CRITICAL: Original capture timestamp used by Admin UI photo grouping
                            created: img.createdIso
                        }
                    ])
                    .commit();

                // Add to existing sets so subsequent duplicates within the batch are tracked
                existingSha1s.add(img.sha1.toLowerCase());
                existingFilenames.add(img.fileName);

                console.log(`OK (Asset: ${asset._id})`);
                uploaded = true;
                successCount++;
                break;
            } catch (err) {
                lastError = err;
                if (attempt < 3) {
                    process.stdout.write(`Retry ${attempt}/3... `);
                    await sleep(2000);
                }
            }
        }

        if (!uploaded) {
            console.log(`FAILED: ${lastError?.message || 'Unknown error'}`);
            failCount++;
        }
    }

    console.log('\n====================================================');
    console.log('                   Upload Summary                   ');
    console.log('====================================================');
    console.log(`Event:                 ${eventDoc.title} (${eventDoc.slug})`);
    console.log(`Total Scanned:         ${localImages.length}`);
    console.log(`Already in Sanity:     ${alreadyUploaded.length}`);
    console.log(`Successfully Uploaded: ${successCount}`);
    console.log(`Failed:                ${failCount}`);
    console.log('====================================================\n');
}

main().catch((err) => {
    console.error('\nFatal Error:', err);
    process.exit(1);
});
