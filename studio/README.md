# IA Event Pics - Sanity Studio

This directory contains the Sanity Studio source code, which defines the schemas for events and manages the CMS interface.

## 📍 Hosted URL
The studio is live at: [https://iaeventpics.sanity.studio/](https://iaeventpics.sanity.studio/)

## 🚀 How to Deploy
You can deploy schema changes directly from the project root using:
```bash
npm run studio:deploy
```
*(Alternatively, run `sanity deploy` inside this folder).*

## 💻 Local Development
To run the studio locally:
1. Ensure you have the Sanity CLI installed: `npm install -g @sanity/cli`
2. Run the development script from the root:
   ```bash
   npm run studio:dev
   ```
3. Open `http://localhost:3333` in your browser.

## 🛠️ Schema Configuration
The main data structure for events is defined in `schemaTypes/event.ts`. Any changes here will be reflected in the studio after the next deployment.
