import {
    OCI_USER_OCID,
    OCI_TENANCY_OCID,
    OCI_FINGERPRINT,
    OCI_REGION,
    OCI_PRIVATE_KEY,
    OCI_NAMESPACE,
    OCI_BUCKET_NAME
} from "$env/static/private";
import * as oci from "oci-sdk";

export async function DELETE({ params }) {
    const imageName = params.name;

    try {
        // Configure authentication
        const provider = new oci.common.SimpleAuthenticationDetailsProvider(
            OCI_TENANCY_OCID,
            OCI_USER_OCID,
            OCI_FINGERPRINT,
            OCI_PRIVATE_KEY,
            null, // passphrase
            oci.common.Region.fromRegionId(OCI_REGION)
        );

        // Create Object Storage client
        const client = new oci.objectstorage.ObjectStorageClient({
            authenticationDetailsProvider: provider
        });

        // Execute delete
        await client.deleteObject({
            namespaceName: OCI_NAMESPACE,
            bucketName: OCI_BUCKET_NAME,
            objectName: imageName
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("OCI Delete Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: error.statusCode || 500
        });
    }
}
