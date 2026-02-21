# IA Event Pics - Copilot Instructions

## Project Overview

IA Event Pics is a SvelteKit 5 web application that provides instant digital photo delivery for physical photobooth events. Photos captured by a Raspberry Pi-based photobooth (pibooth) are immediately uploaded to Sanity.io and made available via event-specific URLs with QR codes.

## Tech Stack

- **Framework**: SvelteKit 5 with Svelte Runes (not Svelte 4)
- **CMS & Storage**: Sanity.io (both metadata and image assets)
- **Styling**: Vanilla CSS with dynamic CSS variables
- **Deployment**: Netlify (frontend) with adapter-netlify
- **Testing**: Playwright for integration tests, Vitest for unit tests
- **Package Manager**: npm (DO NOT use yarn or pnpm)
- **Code Formatting**: Prettier with tabs, single quotes, no trailing commas

## Key Architecture Points

### Data Model
- Images are stored as a `gallery` array within `event` documents in Sanity
- Each event has dynamic branding (colors, fonts) managed through Sanity CMS
- Images include metadata: asset reference, created timestamp, and alt text

### Critical Features
1. **Optimistic Loading**: QR codes are shown before upload completes - the frontend polls every 3 seconds for up to 3 minutes using HEAD requests
2. **Event-Specific Branding**: CSS variables are injected based on Sanity data
3. **Admin Dashboard**: Per-event admin pages at `/[slug]/admin` for image management
4. **Batch Download**: ZIP generation for downloading all event photos

### Important Files
- `src/lib/events.server.js`: Event data fetching via GROQ queries
- `src/lib/sanity.js`: Sanity client configuration
- `src/routes/[slug]/[filename]/+page.svelte`: Image viewer with polling mechanism
- `src/routes/api/image-list/+server.js`: API endpoint for fetching images
- `scripts/sanity-uploader.js`: Photobooth integration script (runs on Raspberry Pi)

## Development Guidelines

### Environment Setup
Always check `.env.example` for required environment variables:
- `VITE_SANITY_PROJECT_ID`: Sanity project ID (public)
- `VITE_SANITY_DATASET`: Dataset name (typically "production")
- `SANITY_API_TOKEN`: Write token for admin operations
- `MASTER_ADMIN_PASSWORD`: Admin authentication

### Code Style
- **ALWAYS** use Prettier configuration (tabs, single quotes, no trailing commas, 100 char width)
- Svelte files use the svelte parser via prettier-plugin-svelte
- Run `npm run format` before committing
- Run `npm run lint` to check formatting

### Svelte 5 Runes (Important!)
This project uses **Svelte 5**, not Svelte 4. Key differences:
- Use `$state()` for reactive state instead of `let` declarations
- Use `$derived()` for computed values instead of `$:` reactive statements
- Use `$effect()` for side effects instead of `onMount` (though onMount is still valid)
- Component props use runes like `let { propName } = $props()`

### Testing
- **Integration tests**: Playwright (run with `npm run test:integration`)
- **Unit tests**: Vitest (run with `npm run test:unit`)
- **Full test suite**: `npm test` (runs both)
- Test files use `.test.js` or `.spec.js` extensions
- Keep tests focused and minimal - only test changed functionality

### Building and Running
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run check`: Type-check with svelte-check
- Deployment is handled automatically via Netlify

### SvelteKit Routing Conventions
- `+page.svelte`: Page component
- `+page.server.js`: Server-side load function and form actions
- `+layout.svelte`: Layout component (wraps pages)
- `+layout.server.js`: Server-side layout data
- `[slug]`: Dynamic route parameters
- Routes use filesystem-based routing

### Sanity Studio
- Located in `/studio` directory
- Has its own package.json and dependencies
- Run with `npm run studio:dev`
- Deploy with `npm run studio:deploy`
- Schema definitions control the CMS structure

## Common Tasks

### Adding a New Feature
1. Check if changes affect event branding or image loading
2. Test with multiple event slugs if route-based
3. Consider impact on mobile users (primary use case)
4. Update documentation in `/docs` if architecture changes

### Modifying Image Display
- Changes to image loading affect `src/routes/[slug]/[filename]/+page.svelte`
- Polling logic is critical - don't remove it
- HEAD requests are used to check existence without downloading
- Error states should be user-friendly (attendees may panic if photos don't load)

### API Changes
- Server-side code runs on Netlify Functions
- Keep API responses minimal (consider bandwidth)
- Always validate admin authentication for write operations

### Styling Changes
- CSS variables are set dynamically per event
- Check `src/routes/[slug]/+layout.svelte` for variable injection
- Maintain light/dark theme support via `data-theme` attribute
- Mobile-first design - most users access via phone after scanning QR

## Pitfalls to Avoid

1. **DON'T** use Svelte 4 syntax (like `$:` reactivity)
2. **DON'T** remove the image polling mechanism - it's essential for the optimistic QR code feature
3. **DON'T** hardcode event data - everything comes from Sanity
4. **DON'T** break mobile responsiveness - this is a mobile-first app
5. **DON'T** commit `.env` files or expose API tokens
6. **DON'T** remove existing tests without replacing them
7. **DON'T** use package managers other than npm (no yarn/pnpm)

## External Integrations

### Photobooth Hardware
- Raspberry Pi running pibooth software
- SSH access: `pi:pi@pibooth.local`
- Working directory: `/home/pi/pibooth`
- Config: `/home/pi/.config/pibooth/pibooth.cfg`
- Uploader script watches for new photos and uploads to Sanity

### Sanity.io
- Images served via Sanity CDN with automatic optimization (WebP, resize)
- GROQ queries used for data fetching
- Write operations require SANITY_API_TOKEN
- Studio deployed separately to sanity.studio

## Documentation

- `README.md`: Project overview and setup
- `docs/technical.md`: Detailed architecture documentation
- `docs/attendee_guide.md`: End-user documentation
- `docs/organizer_guide.md`: Event organizer instructions
- Update docs when making architectural changes

## Getting Help

- Check technical documentation in `/docs/technical.md` first
- Review existing similar implementations in the codebase
- Test changes with a real event slug (e.g., `/example-event/test-image.jpg`)
- Verify mobile experience - this is the primary use case
