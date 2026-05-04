# IA Event Pics (iaevent.pics)

A custom-built photo gallery and distribution platform for an Iowa-based physical photobooth. This project provides a seamless bridge between a physical camera capture and an instant digital delivery for event attendees.

## 📸 How it Works

1.  **Capture:** A physical photobooth (running [pibooth](https://github.com/pibooth/pibooth)) captures a photo during an event.
2.  **Process:** The booth generates two versions:
    - An **Overlay Version** (with event-specific branding).
    - An **Original Version** (the original high-quality capture for organizers).
3.  **Upload:** Images are immediately uploaded to **Sanity.io** using a custom uploader script (`scripts/sanity-uploader.js`).
4.  **Instant Delivery:** The booth optimistically displays a QR code to `https://iaevent.pics/[event-slug]/[filename]` before the upload even finishes. The frontend uses an automated polling mechanism until the image appears in Sanity.

## 🚀 Key Features

- **Svelte 5 Powered:** Built with SvelteKit 5 utilizing runes for high performance.
- **Unified CMS & Storage:** Both event metadata and high-resolution image assets are hosted on Sanity.io.
- **Event-Specific Branding:** Real-time styling updates (colors, fonts) driven by Sanity data.
- **Sanity Image Pipeline:** High-performance, optimized image delivery (WebP, auto-resize).
- **Admin Dashboard:** Per-event admin pages (`/[slug]/admin`) for managing and deleting images directly from the gallery.
- **Batch Download:** One-click ZIP generation for organizers to download all event photos.

## 🛠️ Tech Stack

- **Framework:** SvelteKit (Svelte 5)
- **CMS & Storage:** Sanity.io
- **Styling:** Vanilla CSS
- **Deployment:** Netlify (Frontend) & Sanity.studio (CMS)
- **Barcode Gen:** `qrcode` for in-browser generation.

## 📂 Project Structure

- `/src`: SvelteKit application source.
- `/studio`: Sanity Studio (Schema definitions and CMS UI).
- `/scripts`: Utility scripts for photobooth integration.

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure the following:

```env
# Sanity.io Config
VITE_SANITY_PROJECT_ID="your-project-id"
VITE_SANITY_DATASET="production"
SANITY_API_TOKEN="your-write-token"

# Admin Login
ADMIN_PASSWORD="your-master-admin-password"
```

### Managing Events & Studio

Events are managed via **Sanity Studio**. To add or update an event:

1.  Log in to your Sanity Studio instance.
2.  Create or Edit an "Event" document.
3.  Configure the slug, title, colors, and fonts.
4.  The frontend will automatically reflect these changes.

## 🗺️ Roadmap (TODO)

- [x] **Consolidate Storage:** Migrate from OCI to Sanity.io.
- [x] **Monorepo:** Consolidate Sanity Studio into the main repository.
- [x] **CMS Integration:** Replace hardcoded events with Sanity CMS.
- [x] **Batch Download:** Allow event organizers to download all images in one click.
- [ ] **Multi-booth Capability:** Allow multiple booths (e.g., codename "MOOSE") to be configured via Sanity.
