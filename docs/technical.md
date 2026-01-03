# IA Event Pics: Technical Documentation

## 🏗️ Architecture Overview

IA Event Pics is a SvelteKit-based web application designed for the distribution of photos captured by a physical photobooth.

- **Frontend:** SvelteKit 5 utilizing runes for state management.
- **Backend:** SvelteKit server-side functions running on Netlify Functions.
- **CMS:** Sanity.io for event configuration, metadata, and branding data.
- **Storage:** Oracle Cloud Infrastructure (OCI) Object Storage.
- **Styling:** Vanilla CSS with dynamic CSS variables driven by Sanity data.

## 💾 Data Model

Images are uploaded directly to OCI Object Storage with a per-event prefix.

### Image Naming Convention
- **Path:** `b/booth/o/{event-slug}/{timestamp}.jpg`
- **Types:**
    - `timestamp.jpg`: Overlaid/branded version for attendees.
    - `timestamp-raw.jpg`: Original high-quality capture (hidden from public galleries).

## ⚙️ Backend Logic

### API Endpoints
- `/api/image-list`: Fetches objects from the OCI bucket. 
    - `event={slug}`: Filters results to a specific event directory.
    - `type=all`: Includes raw images in the response.
- `/api/image/[encoded-path]`: 
    - `DELETE`: Deletes an image via the OCI SDK. Requires admin authentication.

## 🎨 Frontend Logic

### Event-Specific Branding
Data is fetched from Sanity via GROQ queries in `src/lib/events.server.js`. Branding is applied by injecting CSS variables into the layout:
- `--color-primary`, `--color-secondary`, `--color-surface`
### Robust Image Loading
To handle the "race condition" where an attendee scans a QR code before the upload from the photobooth is complete, the image viewer implements a robust loading mechanism:
- **Status Tracking:** Uses a `loadingState` (`'checking'`, `'loaded'`, `'error'`) to manage the UI.
- **Automated Polling:** An `onMount` effect triggers a polling interval every 3 seconds.
- **Efficient Checking:** Uses `HEAD` requests to verify image existence on OCI Object Storage without downloading the full file repeatedly.
- **Friendly UI:** Displays a custom loading spinner and reassuring messaging until the image is detected.
- **Fallback:** After 3 minutes (60 retries) without success, it transitions to an error state with a manual refresh option.

## 🚀 Deployment

The project is hosted on **Netlify**.
- **Build Command:** `npm run build`
- **Adapter:** `@sveltejs/adapter-netlify`
- **Environment Variables:** Required for OCI SDK authentication and admin password (see `.env.example`).
