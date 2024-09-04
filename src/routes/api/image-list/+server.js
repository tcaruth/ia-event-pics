import { BUCKET_URL } from "$env/static/private";
import { PUBLIC_BUCKET_READ } from "$env/static/public";

export async function GET() {
    const url = new URL(`${BUCKET_URL}?fields=name,size,etag,timeCreated,md5,timeModified,storageTier,archivalState`);
    
    console.log({url: url.href})
    const allObjects = new Set();

    while (true) {
        const response = await fetch(url);
        const data = await response.json();
        if (data.objects.length === 0) {
            break;
        }

        for (const object of data.objects) {
            if (!object.name.includes('raw')) {
                allObjects.add(object);
            }
        }

        url.searchParams.set('startAfter', data.objects[data.objects?.length - 1].name);
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
        return {
            name: object.name,
            url: `${PUBLIC_BUCKET_READ}${object.name}`,
            created: object.timeCreated,
            md5: object.md5
        }
    });

    // sort by created date, most recent first
    urls.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return new Response(JSON.stringify(urls));
}

