# IA Event Pics (iaevent.pics)

A custom-built photo gallery and distribution platform for an Iowa-based physical photobooth. This project provides a seamless bridge between a physical camera capture and an instant digital delivery for event attendees.

## 📸 How it Works

1.  **Capture:** A physical photobooth (running [pibooth](https://github.com/pibooth/pibooth)) captures a photo during an event.
2.  **Process:** The booth generates two versions: 
    *   An **Overlay Version** (with event-specific branding).
    *   A **Raw Version** (the original high-quality capture for organizers).
3.  **Upload:** Images are named by timestamp (e.g., `202512300123456.jpg`) and immediately uploaded to Oracle Cloud Infrastructure (OCI) Object Storage.
4.  **Instant Delivery:** The booth optimistically displays a QR code to `https://iaevent.pics/image/[filename]` before the upload even finishes. By the time the attendee scans and opens the page, the image is live.

## 🚀 Key Features

*   **Svelte 5 Powered:** Built with the latest SvelteKit features for high performance and smooth transitions.
*   **Event-Specific Branding:** Dynamic styling (colors, fonts, logos) based on event configuration.
*   **OCI Integration:** Uses OCI Object Storage with Pre-Authenticated Requests (PAR) for public reading and the OCI SDK for server-side management (deletion).
*   **Attendee Experience:** Mobile-friendly viewing, easy "Share" API integration, and download capabilities.
*   **Admin Dashboard:** A simple, password-protected interface for managing and deleting images via authenticated OCI SDK calls.
*   **Raw Image Protection:** Automatically filters out "raw" images from the public gallery, keeping them available for marketing use only.

## 🛠️ Tech Stack

*   **Framework:** SvelteKit (Svelte 5)
*   **Styling:** Vanilla CSS
*   **Storage:** OCI Object Storage
*   **Deployment:** Netlify
*   **Barcode Gen:** `qrcode` for in-browser generation.

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following:

```env
# URL for Reading (Public PAR)
PUBLIC_BUCKET_READ="https://.../b/bucket/o/"

# Admin Login
ADMIN_PASSWORD="your-secure-password"

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

> **Security Note:** Never commit your `.env` file or OCI private key to GitHub. When deploying to Netlify, add these credentials as Environment Variables in the Netlify Dashboard. The `OCI_PRIVATE_KEY` should be the full string content of your `.pem` file.

### Managing Events

Currently, events are managed via hardcoded configuration in `src/lib/events.server.js`. To add or update an event:
1.  Open `src/lib/events.server.js`.
2.  Update the `events` Map with the new event ID, name, colors, and branding assets.
3.  Deploy the changes.

## 🗺️ Roadmap (TODO)

- [ ] **CMS Integration:** Replace hardcoded events with a proper database or headless CMS (like Sanity).
- [ ] **Event Archive:** Better navigation for past events.
- [x] **Batch Download:** Allow event organizers to download all overlaid and raw images for an event in one click.
- [ ] ** Multi-booth Capability** - Allow multiple booths to be configured and managed from a single admin interface.
    - someday in the future i plan on building another photobooth, so assume this one is codename "MOOSE". when that time comes, I want to be able to turn the photobooth on, have it fetch a yaml pibooth config stored in sanity and initialize itself with whatever the current event assigned to MOOSE is. I should be able to reassign MOOSE to a second event, reboot it, and it now uses that event's yaml instead. I'll take care of the pibooth and yaml stuff, just focus on the sanity bits for now.  
