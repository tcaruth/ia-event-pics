import { getEvent } from "$lib/events.server";
import { client } from "$lib/sanity";
import { MASTER_ADMIN_PASSWORD } from "$env/static/private";

export async function load({ params, cookies }) {
    const session = cookies.get('session');
    const isMasterAdmin = session === 'master';
    const event = await getEvent(params.slug, true);
    return {
        images: event?.images || [],
        event: event,
        slug: params.slug,
        isMasterAdmin
    };
}

export const actions = {
    unlockMaster: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        if (password === MASTER_ADMIN_PASSWORD) {
            cookies.set('session', 'master', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24
            });
            return { success: true, message: 'Master admin access granted' };
        }

        return { success: false, error: 'Incorrect master password' };
    },
    deleteBatch: async ({ request, params, cookies }) => {
        const session = cookies.get('session');
        const data = await request.formData();
        const providedMasterPassword = data.get('masterPassword');

        const isMaster = session === 'master' || providedMasterPassword === MASTER_ADMIN_PASSWORD;
        if (!isMaster) {
            return {
                success: false,
                error: 'Batch deletion is restricted to master administrators.'
            };
        }

        // Elevate session if master password was provided and valid
        if (providedMasterPassword === MASTER_ADMIN_PASSWORD && session !== 'master') {
            cookies.set('session', 'master', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24
            });
        }

        const keysData = data.get('keys');
        let keys = [];
        if (typeof keysData === 'string') {
            try {
                const parsed = JSON.parse(keysData);
                if (Array.isArray(parsed)) keys = parsed;
            } catch {
                keys = data.getAll('keys').map(k => String(k));
            }
        } else {
            keys = data.getAll('keys').map(k => String(k));
        }

        keys = keys.filter(Boolean);

        if (keys.length === 0) {
            return { success: false, error: 'At least one photo must be selected for deletion.' };
        }

        const eventSlug = params.slug;

        try {
            const event = await client.fetch(
                `*[_type == "event" && slug.current == $slug][0]{_id}`,
                { slug: eventSlug }
            );

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            const CHUNK_SIZE = 50;
            for (let i = 0; i < keys.length; i += CHUNK_SIZE) {
                const chunk = keys.slice(i, i + CHUNK_SIZE);
                const unsetPaths = chunk.map(key => `gallery[_key=="${key}"]`);
                await client
                    .patch(event._id)
                    .unset(unsetPaths)
                    .commit();
            }

            return {
                success: true,
                deletedCount: keys.length,
                message: `Successfully deleted ${keys.length} photo${keys.length === 1 ? '' : 's'}.`
            };
        } catch (e) {
            console.error('Sanity Batch Delete Error:', e);
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    },
    delete: async ({ request, params }) => {
        const data = await request.formData();
        const key = data.get('fullPath'); // This is the _key from Sanity
        const eventSlug = params.slug;

        if (!key) {
            return { success: false, error: 'Image key is required' };
        }

        try {
            // Find the event document ID
            const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, { slug: eventSlug });

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            // Remove the image from the gallery array using its _key
            await client
                .patch(event._id)
                .unset([`gallery[_key=="${key}"]`])
                .commit();

            return { success: true };
        } catch (e) {
            console.error('Sanity Delete Error:', e);
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    },
    deleteAll: async ({ params }) => {
        const eventSlug = params.slug;

        try {
            // Find the event document ID
            const event = await client.fetch(`*[_type == "event" && slug.current == $slug][0]{_id}`, { slug: eventSlug });

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            // Clear the entire gallery array
            await client
                .patch(event._id)
                .set({ gallery: [] })
                .commit();

            return { success: true, message: 'All photos deleted' };
        } catch (e) {
            console.error('Sanity Delete All Error:', e);
            return { success: false, error: e instanceof Error ? e.message : 'An unknown error occurred' };
        }
    },
    print: async ({ request, params }) => {
        const data = await request.formData();
        const key = data.get('fullPath');
        const assetUrl = data.get('assetUrl');
        const imageName = data.get('imageName');
        const eventSlug = params.slug;

        if (!key || !assetUrl) {
            return { success: false, error: 'Image details are required for printing' };
        }

        try {
            const event = await client.fetch(
                `*[_type == "event" && slug.current == $slug][0]{
                    _id,
                    "isPhotoboothActive": count(*[_type == "photobooth" && activeEvent->slug.current == $slug]) > 0
                }`,
                { slug: eventSlug }
            );

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            if (!event.isPhotoboothActive) {
                return { success: false, error: 'Printing is only available while the event is active and assigned to a photobooth' };
            }

            const printTask = {
                _key: `print_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                imageKey: String(key),
                assetUrl: String(assetUrl),
                imageName: String(imageName || ''),
                status: 'pending',
                requestedAt: new Date().toISOString()
            };

            await client
                .patch(event._id)
                .setIfMissing({ printQueue: [] })
                .append('printQueue', [printTask])
                .commit();

            return { success: true, message: `Print job queued for ${imageName || 'photo'}` };
        } catch (e) {
            console.error('Sanity Print Queue Error:', e);
            return { success: false, error: e instanceof Error ? e.message : 'Failed to queue print job' };
        }
    }
};
