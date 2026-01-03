import { BUCKET_URL } from "$env/static/private";
import { PUBLIC_BUCKET_READ } from "$env/static/public";

export async function GET({ url: requestUrl }) {
    console.log('GET /api/image-list called');
    const downloadType = requestUrl.searchParams.get('type') || 'overlaid';
    const eventSlug = requestUrl.searchParams.get('event');

    // Append prefix if eventSlug is provided to filter by directory/prefix
    let bucketUrl = `${BUCKET_URL}?fields=name,size,etag,timeCreated,md5,timeModified,storageTier,archivalState`;
    if (eventSlug) {
        bucketUrl += `&prefix=${eventSlug}/`;
    }

    console.log({ url: bucketUrl })
    const allObjects = new Set();

    // We need to handle pagination manually if there are many objects
    // The previous loop logic was slightly wrong if it was appending to a const URL object, 
    // but here I am reconstructing the URL string/object in the loop or restart.
    // Use a URL object for cleaner param handling.
    const urlObj = new URL(bucketUrl);

    while (true) {
        const response = await fetch(urlObj.toString());
        if (!response.ok) {
            console.error('Failed to fetch from bucket:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text);
            // If prefix not found (404), return empty list instead of error
            if (response.status === 404) {
                return new Response(JSON.stringify([]));
            }
            throw new Error(`Bucket fetch failed: ${response.status}`);
        }
        const data = await response.json();
        if (!data.objects || data.objects.length === 0) {
            break;
        }

        for (const object of data.objects) {
            if (downloadType === 'all' || !object.name.includes('raw')) {
                allObjects.add(object);
            }
        }

        // If we received fewer objects than limit (default 1000 usually), we are done.
        // Or strictly check if nextStartWith is needed.
        // The OCI API usually returns `nextStartWith` or we use the last name.
        // The original code used `startAfter`.
        if (data.objects.length < 1000) { // Assuming 1000 is default limit
            break;
        }

        urlObj.searchParams.set('startAfter', data.objects[data.objects.length - 1].name);
    }

    /**
     * @typedef {Object} ObjectInList
     * @property {string} name
     * @property {number} size
     * @property {string} timeCreated
     * @property {string} timeModified
     * @property {string} etag
     * @property {string} storageTier
     * @property {string} md5
     */
    const urls = Array.from(allObjects).map(( /** @type {ObjectInList} */ object) => {
        // Remove the prefix from the name if we want clean filenames, 
        // OR keep full name but client logic might expect just filename.
        // The client `<img>` src just uses `image.url`.
        // The client link `<a href>` uses `image.name`.
        // If `image.name` is `slug/filename.jpg`, the link becomes `/[slug]/slug/filename.jpg`.
        // That seems wrong. The user said `iaevent.pics/{slug}/{filename}`.
        // So we should probably strip the prefix for `name` property used in routing,
        // BUT `image.url` must contain the full path.

        const fullPath = object.name;
        // Strip slug prefix for cleaner UI usage?
        // If I strip it, `image.name` = `filename.jpg`.
        // Then `<a href="./{slug}/{image.name}">` = `/[slug]/filename.jpg`. Correct.

        const name = eventSlug && fullPath.startsWith(eventSlug + '/')
            ? fullPath.replace(eventSlug + '/', '')
            : fullPath;

        return {
            name: name,
            fullPath: fullPath,
            url: `${PUBLIC_BUCKET_READ}${fullPath}`,
            created: object.timeCreated,
            md5: object.md5
        }
    });

    // sort by created date, most recent first
    urls.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return new Response(JSON.stringify(urls));
}
