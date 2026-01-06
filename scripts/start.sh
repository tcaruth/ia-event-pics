#!/bin/bash
set -e
set -o pipefail

export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority
export HOME=/home/pi
export XDG_RUNTIME_DIR=/run/user/1000

export SDL_VIDEODRIVER=x11
export XDG_SESSION_TYPE=x11

# Debug

echo "Current Environment:" > /home/pi/sanity-controller/last_env.log
env >> /home/pi/sanity-controller/last_env.log

. /home/pi/.nvm/nvm.sh
NODE_PATH=$(nvm which 18)
# exec $NODE_PATH ./sanity-uploader.js --dir /home/pi/Pictures/pibooth --photobooth "Moose" >> /home/pi/sanity-controller/last_log.log 2>&1

# This sends everything (stdout + stderr) to the log file AND the console
mv last_log.log last_log.log.old
$NODE_PATH ./sanity-uploader.js --dir /home/pi/Pictures/pibooth --photobooth "Moose" 2>&1 | tee -a /home/pi/sanity-controller/last_log.log