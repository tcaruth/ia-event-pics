# IA Event Pics: Technical Documentation

## 🏗️ Architecture Overview

IA Event Pics is a SvelteKit-based web application designed for the distribution of photos captured by a physical photobooth (running [pibooth](https://github.com/pibooth/pibooth)).

- **Frontend:** SvelteKit 5 utilizing runes for state management.
- **Backend:** SvelteKit server-side functions (+page.server.js, +server.js) running on Netlify Functions.
- **Storage:** Oracle Cloud Infrastructure (OCI) Object Storage.
- **Styling:** Vanilla CSS with dynamic CSS variables for event-specific branding.

## 💾 Data Model

Images are uploaded directly to OCI Object Storage by the pibooth instance.

### Image Naming Convention
- **Format:** `YYYYMMDDHHMMSS.jpg` (e.g., `202512300123456.jpg`)
- **Overlaid Images:** These are the default images served to users, containing event branding.
- **Raw Images:** Suffixed with `-raw` (e.g., `202512300123456-raw.jpg`). These are filtered out from the public gallery and intended for organizer use only.

## ⚙️ Backend Logic

### API Endpoints
- `/api/image-list`: Fetches a list of all objects in the OCI bucket. 
    - `type=all`: If present, includes raw images in the response. Sorting remains chronological.
- `/api/image/[name]`: 
    - `DELETE`: Uses the OCI SDK to delete an image from the bucket. Requires admin authentication.

### Bulk Download Implementation
The bulk download feature is implemented client-side to minimize server resource usage.
1.  **Preparation:** The admin client fetches the full image list (including raw) from `/api/image-list?type=all`.
2.  **Compression:** Using `jszip`, the client downloads each image blob and adds it to an in-memory ZIP archive.
3.  **Naming:** Files are renamed to a human-friendly format `[event-slug]_[timestamp]_[type].[ext]` during the bundling process.
4.  **Delivery:** A data URL for the generated blob is created and a programmatic click on a hidden anchor tag triggers the download.

## 📦 External Libraries
- **`jszip`**: Used for client-side creation and compression of ZIP archives.

### OCI Integration
The application uses two methods for OCI access:
1.  **Public Access (PAR):** Images are served via a Pre-Authenticated Request (PAR) URL for read-only access.
2.  **Administrative Access (OCI SDK):** Deletions are handled server-side using the OCI Node.js SDK, authenticated via API keys (OCIDs, Fingerprint, Private Key).

## 🎨 Frontend Logic

### Event-Specific Branding
Events are defined in `src/lib/events.server.js`. Each event can specify:
- Colors (primary, secondary, surface)
- Fonts (heading, main)
- Logos/Primary images

The branding is applied dynamically by setting CSS variables on the root element based on the `e` query parameter (e.g., `?e=1`).

## 🚀 Deployment

The project is hosted on **Netlify**.
- **Build Command:** `npm run build`
- **Adapter:** `@sveltejs/adapter-netlify`
- **Environment Variables:** Required for OCI SDK authentication and admin password (see `.env.example`).
