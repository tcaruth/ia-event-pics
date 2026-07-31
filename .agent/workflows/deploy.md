---
description: connecting to photobooth via ssh
---

The photobooth is able to be reached by SSH pi:pi@pibooth.local. If `pibooth.local` does not resolve on local network, prompt the user to verify the Pi is powered on or provide its direct IP address.

The working directory for the pibooth project is at /home/pi/pibooth, or ~/pibooth if connecting with the credentials above.

Configuration of the current "event" is located in a configuration file at /home/pi/.config/pibooth/pibooth.cfg