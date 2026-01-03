# Photobooth Sanity Uploader

This guide explains how to set up the Sanity image uploader on a Raspberry Pi running `pibooth`.

## Prerequisites

1. **Node.js**: The script requires Node.js. Install it on your Pi:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Sanity API Token**: 
   - Go to [manage.sanity.io](https://manage.sanity.io)
   - Select your project -> Settings -> API
   - Create a new **Write** token. Keep this secret!

## Installation

1. Copy the `scripts/` directory and `package.json` to a folder on your Pi (e.g., `/home/pi/sanity-uploader`).
2. Install dependencies:
   ```bash
   npm install chokidar @sanity/client dotenv minimist
   ```
3. Create a `.env` file in the uploader directory:
   ```env
   SANITY_PROJECT_ID=your_project_id
   SANITY_DATASET=production
   SANITY_API_TOKEN=your_write_token
   ```

## Usage

Run the script by pointing it to your `pibooth` output directory and the event slug:

```bash
node sanity-uploader.js --dir /home/pi/Pictures/pibooth --event my-event-slug
```

### Run on Startup (systemd)

To make it run automatically in the background, create a systemd service:

1. Create a service file: `sudo nano /etc/systemd/system/sanity-uploader.service`
2. Paste the following (update paths):
   ```ini
   [Unit]
   Description=Sanity Image Uploader
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/sanity-uploader
   ExecStart=/usr/bin/node sanity-uploader.js --dir /home/pi/Pictures/pibooth --event my-event-slug
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start:
   ```bash
   sudo systemctl enable sanity-uploader
   sudo systemctl start sanity-uploader
   ```

## How it Works
The script uses `chokidar` to watch the file system. When `pibooth` saves a new photo, the script:
1. Detects the new file.
2. Characterizes the asset in Sanity.
3. Appends a reference to the image in the specific Event's `gallery` array.
4. Uses the `_key` as a unique identifier for synchronization.
