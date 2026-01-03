import fs from 'fs';
import * as oci from 'oci-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Load .env manually
const envPath = path.resolve(projectRoot, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
let currentKey = null;
let currentValue = '';

envContent.split('\n').forEach((line) => {
    if (currentKey) {
        currentValue += '\n' + line;
        if (line.trim().endsWith('"') || line.trim().endsWith("'")) {
            let val = currentValue.trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            env[currentKey] = val;
            currentKey = null;
        }
        return;
    }

    if (line.trim().startsWith('#') || !line.includes('=')) return;

    const parts = line.split('=');
    const key = parts[0].trim();
    let value = parts.slice(1).join('=').trim();

    if (
        (value.startsWith('"') && !value.endsWith('"')) ||
        (value.startsWith("'") && !value.endsWith("'"))
    ) {
        currentKey = key;
        currentValue = value;
    } else {
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[key] = value;
    }
});

// Handles PEM key with newlines correctly if it was single line in .env (though usually it is multi-line string in env file?)
// In the viewed file it looked like a multi-line string.
// Let's assume the simple parser gets the first line/part.
// Actually, for multi-line OCI_PRIVATE_KEY, checking the ViewFile output:
// It was:
const provider = new oci.common.SimpleAuthenticationDetailsProvider(
    env.OCI_TENANCY_OCID,
    env.OCI_USER_OCID,
    env.OCI_FINGERPRINT,
    env.OCI_PRIVATE_KEY,
    null,
    oci.common.Region.US_ASHBURN_1
);

const objectStorageClient = new oci.objectstorage.ObjectStorageClient({
    authenticationDetailsProvider: provider
});

async function uploadFromUrl(imageUrl, filename, slug) {
    console.log(`Fetching ${imageUrl}...`);
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    console.log(`Uploading ${filename} to ${slug}...`);
    const putObjectRequest = {
        namespaceName: env.OCI_NAMESPACE,
        bucketName: env.OCI_BUCKET_NAME,
        putObjectBody: buffer,
        objectName: `${slug}/${filename}`,
        contentType: 'image/jpeg'
    };

    await objectStorageClient.putObject(putObjectRequest);
    console.log(`Successfully uploaded ${filename}`);
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
        await uploadFromUrl(img.url, img.name, slug);
    }
}

main().catch(console.error);
main().catch(console.error);
