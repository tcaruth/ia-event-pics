# IA Event Pics (iaevent.pics)

A custom-built photo gallery and distribution platform for an Iowa-based physical photobooth. This project provides a seamless bridge between a physical camera capture and an instant digital delivery for event attendees.

## 📸 How it Works

1.  **Capture:** A physical photobooth (running [pibooth](https://github.com/pibooth/pibooth)) captures a photo during an event.
2.  **Process:** The booth generates two versions: 
    *   An **Overlay Version** (with event-specific branding).
    *   An **Original Version** (the original high-quality capture for organizers).
3.  **Upload:** Images are named by timestamp (e.g., `202512300123456.jpg`) and immediately uploaded to Oracle Cloud Infrastructure (OCI) Object Storage using a per-event prefix: `b/booth/o/{event-slug}/{filename}.jpg`.
4. **Instant Delivery:** The booth optimistically displays a QR code to `https://iaevent.pics/[event-slug]/[filename]` before the upload even finishes. The frontend uses an automated polling mechanism to check for the image's availability, ensuring it appears as soon as the upload is complete without requiring a manual refresh.

## 🚀 Key Features

*   **Svelte 5 Powered:** Built with the latest SvelteKit features for high performance and smooth transitions.
*   **Sanity CMS Integration:** Dynamic event configuration (colors, fonts, passwords) managed via Sanity Studio.
*   **Event-Specific Branding:** Real-time styling updates based on CMS data.
*   **OCI Integration:** Uses OCI Object Storage with Pre-Authenticated Requests (PAR) for public reading and the OCI SDK for server-side management.
*   **Attendee Experience:** Mobile-friendly viewing, easy "Share" API integration, and download capabilities.
*   **Admin Dashboard:** Per-event admin pages (`/[slug]/admin`) for managing and deleting images.
*   **Batch Download:** One-click ZIP generation for organizers to download all event photos (overlaid and original).

## 🛠️ Tech Stack

*   **Framework:** SvelteKit (Svelte 5)
*   **CMS:** Sanity.io
*   **Styling:** Vanilla CSS
*   **Storage:** OCI Object Storage
*   **Deployment:** Netlify
*   **Barcode Gen:** `qrcode` for in-browser generation.

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following:

```env
# URL for Reading (Public PAR)
PUBLIC_BUCKET_READ="https://.../b/bucket/o/"

# Sanity Configuration
VITE_SANITY_PROJECT_ID="your-project-id"
VITE_SANITY_DATASET="production"

# Admin Login
ADMIN_PASSWORD="your-master-admin-password"

# OCI SDK Credentials (Required for Deletion)
OCI_USER_OCID="ocid1.user.oc1..."
OCI_TENANCY_OCID="ocid1.tenancy.oc1..."
OCI_FINGERPRINT="xx:xx:xx..."
OCI_REGION="us-ashburn-1"
OCI_NAMESPACE="your-namespace"
OCI_BUCKET_NAME="booth"

# LOCALLY: Paste PEM content here. 
# IN NETLIFY: Set as Environment Variable.
OCI_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

### Managing Events

Events are managed via **Sanity Studio**. To add or update an event:
1.  Log in to your Sanity Studio instance.
2.  Create or Edit an "Event" document.
3.  Configure the slug, title, colors, and fonts.
4.  The frontend will automatically reflect these changes.

## 🗺️ Roadmap (TODO)

- [x] **CMS Integration:** Replace hardcoded events with Sanity CMS.
- [x] **Batch Download:** Allow event organizers to download all images in one click.
- [ ] **Multi-booth Capability:** Allow multiple booths (e.g., codename "MOOSE") to be configured and managed via Sanity.
