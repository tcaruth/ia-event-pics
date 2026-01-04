# IA Event Pics: Technical Documentation

## 🏗️ Architecture Overview

IA Event Pics is a SvelteKit-based web application designed for the distribution of photos captured by a physical photobooth.

- **Frontend:** SvelteKit 5 utilizing runes for state management.
- **Backend:** SvelteKit server-side functions running on Netlify Functions.
- **CMS & Storage:** Sanity.io for all event metadata and image asset hosting.
- **Styling:** Vanilla CSS with dynamic CSS variables driven by Sanity data.

## 💾 Data Model

Images are managed within Sanity as a `gallery` array on the `event` document.

### Image Structure
- **Reference:** Images are stored as Sanity assets.
- **Metadata:** Each image in the gallery contains:
    - `asset`: Reference to the image file.
    - `created`: ISO timestamp of capture.
    - `alt`: Descriptive text for accessibility.
- **Optimization:** Served via Sanity's image pipeline (WebP, auto-resize).

## ⚙️ Backend Logic

### API Endpoints
- `/api/image-list?event={slug}`: Fetches event-specific images from Sanity.
- Deletion: Managed via a Form Action in `src/routes/[slug]/admin/+page.server.js` using the Sanity write token.

## 🎨 Frontend Logic

### Event-Specific Branding
Data is fetched from Sanity via GROQ queries in `src/lib/events.server.js`. Branding is applied by injecting CSS variables into the layout:
- `--color-primary`, `--color-secondary`, `--color-surface`
- **Theme:** A `data-theme` attribute (e.g., `dark`, `light`) is applied to the `<body>` tag based on event settings.
### Robust Image Loading
To handle the "race condition" where an attendee scans a QR code before the upload from the photobooth is complete, the image viewer implements a robust loading mechanism:
- **Status Tracking:** Uses a `loadingState` (`'checking'`, `'loaded'`, `'error'`) to manage the UI.
- **Automated Polling:** An `onMount` effect triggers a polling interval every 3 seconds.
- **Efficient Checking:** Uses `HEAD` requests to verify image existence on Sanity CDN without downloading the full file repeatedly.
- **Friendly UI:** Displays a custom loading spinner and reassuring messaging until the image is detected.
- **Fallback:** After 3 minutes (60 retries) without success, it transitions to an error state with a manual refresh option.

## 📂 Project Structure

- `/src`: Main SvelteKit application.
- `/studio`: Sanity Studio (Schema definitions and CMS UI).
- `/scripts`: Utility scripts for photobooth integration and testing.

## 🚀 Deployment

The project is hosted on **Netlify**.
- **Build Command:** `bun run build`
- **Adapter:** `@sveltejs/adapter-netlify`
- **Environment Variables:**
    - `SANITY_API_TOKEN`: Required for write operations (deletions/uploads).
    - `VITE_SANITY_PROJECT_ID` & `VITE_SANITY_DATASET`: Sanity configuration.

The Sanity Studio is deployed independently to **sanity.studio** via `npm run studio:deploy`.
