# AGENTS.md — Agent Guidelines & Project Overview

Welcome to **IA Event Pics** (`iaevent.pics`), a photobooth gallery and digital photo distribution platform connecting physical photobooth captures directly with attendees.

This document serves as the authoritative operational guide for all AI agent sessions working within this codebase.

---

## 🏛️ Project Architecture

The repository is structured into three main components:

1. **SvelteKit Web Gallery (`/src`)**
   * **Framework:** SvelteKit powered by **Svelte 5** (utilizing Svelte 5 Runes).
   * **Deployment:** Hosted on **Netlify** using `@sveltejs/adapter-netlify`.
   * **Styling:** Vanilla CSS with dynamic HSL themes and custom typography populated from Sanity CMS.

2. **Sanity Studio CMS (`/studio`)**
   * **Framework:** Sanity Studio v3 monorepo.
   * **Schemas:** Located in `studio/schemaTypes/` (`event.ts`, `photobooth.ts`).
   * **Role:** Manages event metadata (title, dates, slug, custom colors/fonts, overlay templates, admin access) and hosts all uploaded photo assets.

3. **Photobooth Integration Daemon (`/scripts`)**
   * **Hardware Target:** Raspberry Pi running `pibooth` (connected at `pi:pi@pibooth.local`).
   * **Uploader Script:** `scripts/sanity-uploader.js` watches local capture directories and uploads raw/overlay photos directly to Sanity.io, rendering immediate QR codes.

---

## 🛠️ Tooling & Command Standards

* **Package Manager:** **Bun** is the designated package manager for this repository.
  * Always use `bun` over `npm`, `pnpm`, or `yarn`.
  * Install dependencies: `bun install`
  * Start dev server: `bun run dev`
  * Run unit tests: `bun run test:unit`
  * Run integration tests: `bun run test:integration`
  * Studio dev: `bun run studio:dev`

* **Svelte Conventions:**
  * **Strict Svelte 5 Runes:** Always use Svelte 5 reactive runes (`$state`, `$derived`, `$props`, `$effect`) for all component reactivity. Avoid Svelte 4 legacy syntax (`let x = 0`, `$: ...`, `export let ...`).

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` when configuring new environments:

```env
# Sanity.io Credentials
VITE_SANITY_PROJECT_ID="your-project-id"
VITE_SANITY_DATASET="production"
SANITY_API_TOKEN="your-write-token"

# Gallery Admin
ADMIN_PASSWORD="your-master-admin-password"
```

---

## 🌐 Hardware & Deployment Workflows

* **Photobooth Remote Access (`/deploy` Workflow):**
  * SSH Target: `pi:pi@pibooth.local` (If `pibooth.local` is unresolvable, ask user for Pi IP address or power state)
  * Working Directory: `/home/pi/pibooth`
  * Configuration File: `/home/pi/.config/pibooth/pibooth.cfg`

* **Photobooth Integration Daemon (`/scripts` & `sanity-controller`):**
  * SSH Target: `pi:pi@pibooth.local`
  * Working Directory on Pi: `/home/pi/sanity-controller`
  * Daemon GitHub Repository: [`tcaruth/pibooth-sanity-controller`](https://github.com/tcaruth/pibooth-sanity-controller) (Remote alias: `daemon`)
  * **Daemon Deployment Workflow:**
    1. Edit scripts locally in `/scripts/` and commit changes.
    2. Push subtree to daemon repository: `git subtree push --prefix scripts daemon main`
    3. On Pi (`/home/pi/sanity-controller`): `git pull && sudo systemctl restart photobooth`

* **Sanity Studio Deployment:**
  * Deploy schema changes via `bun run studio:deploy`.

---

## 📋 Rules & Compliance Checklist

* **Verification:** Always run `bun run test:unit` and `bun run check` after making changes to verify TypeScript and logic integrity.
* **Documentation Rule:** After completing a feature or bugfix, inspect and update relevant project documentation (`README.md`, `AGENTS.md`, or `/docs`) per `.agent/rules/documentation.md`.
