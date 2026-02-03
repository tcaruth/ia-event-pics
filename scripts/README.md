# Photobooth Controller & Uploader

This script serves as the master controller for the photobooth. It manages the startup sequence, synchronizes configuration from Sanity.io (Event details, Colors, Overlays), launches the `pibooth` application, and uploads new photos to the cloud.

## Prerequisites

1. **Node.js**: Requires Node.js 18+.
   ```bash
   nvm install 18 && nvm use 18
   ```

2. **Sanity API Token**: Requires a token with **Write** permissions.

## Installation

1. Copy the contents of the `scripts/` directory to your Pi (e.g., `/home/pi/sanity-controller`).
   - This should include `package.json`, `sanity-uploader.js`, `start.sh`, and any `.cfg` files.
2. Install dependencies:
   ```bash
   cd /home/pi/sanity-controller
   npm install
   chmod +x start.sh
   ```
   *Note: Edit `start.sh` to ensure the `--photobooth` name and directories match your specific setup.*
3. Create a `.env` file:
   ```env
   SANITY_PROJECT_ID=your_id
   SANITY_DATASET=production
   SANITY_API_TOKEN=your_token
   ```

## Usage

This script should be the primary entry point for your photobooth service.

```bash
node sanity-uploader.js --dir <photo_dir> [--event <slug> | --photobooth <name>] [--config <cfg_path>]
```

### Arguments
- `--dir`: Directory to watch for new photos (e.g., `/home/pi/Pictures/pibooth`).
- `--photobooth`: (Recommended) Name of the photobooth document in Sanity. The script will look up the active event dynamically.
- `--event`: (Manual Override) Directly specify event slug.
- `--config`: (Optional) Path to `pibooth.cfg`. Defaults to `~/.config/pibooth/pibooth.cfg`.

### Automatic Startup (systemd)

The `start.sh` script is used as a wrapper to load `nvm` and the correct Node version before launching the uploader.

Create a single service to manage the entire booth: `sudo nano /etc/systemd/system/photobooth.service`

```ini
[Unit]
Description=Sanity Photobooth Controller
After=network.target

[Service]
Type=simple
User=pi
Environment="DISPLAY=:0"
Environment="XAUTHORITY=/home/pi/.Xauthority"
WorkingDirectory=/home/pi/sanity-controller
# usage of start.sh ensures nvm/node environment is loaded correctly
ExecStart=/home/pi/sanity-controller/start.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable photobooth
sudo systemctl start photobooth
```

## How it Works

1. **Network Resilience**: On startup, the script waits for a successful connection to the Sanity API (`*.api.sanity.io`). It correctly handles temporary DNS failures (`EAI_AGAIN`) and stays in a wait-loop until the network is fully available.
2. **Configuration Sync**:
   - Fetches the active Event from Sanity based on the photobooth name.
   - **Colors**: Converts Sanity color palette to `pibooth.cfg` RGB values (Window background, text colors).
   - **Overlay**: Downloads the event's specific overlay image and updates the local pibooth config.
   - **QR Codes**: Automatically updates the QR code prefix URL to point to the correct event page.
3. **Launch Pibooth**: Spawns the `pibooth` application in the background with appropriate GUI environment variables.
4. **Watch & Upload**: Monitors the photo directory and instantly uploads new images to the Event's gallery in Sanity.

## Troubleshooting

### EAI_AGAIN / DNS Issues
If you see `EAI_AGAIN` errors in the logs, it means the Pi is having trouble resolving the Sanity API address. This is usually transient. The updated `sanity-uploader.js` includes a robust check that waits for this to clear before proceeding.

### Video system not initialized (PyGame)
This usually happens if the `photobooth` service is running in an environment without access to the X server. Ensure `DISPLAY=:0` and `XAUTHORITY` are correctly set in both `start.sh` and the `systemd` service file.

### Service Failures not Restarting
If the script crashes but `systemctl status` shows it as "Succeeded", check your `start.sh`. Ensure it uses `set -e` and `set -o pipefail` so that pipe operations (like logging to `tee`) don't mask exit codes.
