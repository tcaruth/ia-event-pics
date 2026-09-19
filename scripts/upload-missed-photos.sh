#!/bin/bash
set -e

# ==============================================================================
# Sanity Missed Photos Uploader Launcher
# Can be run directly from terminal or double-clicked on Raspberry Pi Desktop
# ==============================================================================

# Ensure NVM and Node 18 are available
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    NODE_PATH=$(nvm which 18 2>/dev/null || which node)
else
    NODE_PATH=$(which node)
fi

if [ -z "$NODE_PATH" ]; then
    echo "Error: Node.js could not be found in PATH or NVM."
    read -p "Press Enter to exit..."
    exit 1
fi

CONTROLLER_DIR="/home/pi/sanity-controller"
SCRIPT_PATH="$CONTROLLER_DIR/upload-missed-photos.js"

# If not running on Pi in sanity-controller, check local directory
if [ ! -f "$SCRIPT_PATH" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/upload-missed-photos.js" ]; then
        CONTROLLER_DIR="$SCRIPT_DIR"
        SCRIPT_PATH="$SCRIPT_DIR/upload-missed-photos.js"
    fi
fi

cd "$CONTROLLER_DIR"

echo "Using Node: $NODE_PATH"
echo "Running: $SCRIPT_PATH"
echo ""

$NODE_PATH "$SCRIPT_PATH" "$@"

EXIT_CODE=$?

echo ""
read -p "Upload complete. Press Enter to close this window..."
exit $EXIT_CODE
