# Product Requirements Document (PRD)
## Universal Event Capture Platform (`ia-event-pics` v2)

**Document Status:** Final Draft  
**Target Platform:** Cross-Platform (Raspberry Pi 4/5 / Pi Zero 2W / x86 Mini-PC)  
**Author:** AI Pair Programmer & System Architect  

---

## 1. Executive Summary & Vision

The goal of this project is to completely replace the legacy Python/Pygame-based `pibooth` framework with a modern, high-performance, modular **Universal Event Capture Platform**.

The new architecture decouples capture, hardware control, and user interface into a **Node.js/Bun local daemon** and a **Svelte 5 Kiosk web application**. It supports three distinct event capture modalities—**Photo Booth**, **Audio Guestbook**, and **Video Guestbook**—operating seamlessly across low-cost hardware (Raspberry Pi with HQ Camera Module) and high-performance hardware (x86 Mini-PCs).

All modalities share 100% of the administration pipeline (Sanity CMS), cloud media distribution (`iaevent.pics`), and core visual design language.

---

## 2. Platform Architecture & Stack Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │               Sanity CMS + SvelteKit Admin              │
 │  (Event metadata, design themes, mode selector:         │
 │   'photo' | 'audio' | 'video', prints, gallery)         │
 └────────────────────────────┬────────────────────────────┘
                              │ Realtime Sync (WebSockets / HTTPS)
 ┌────────────────────────────▼────────────────────────────┐
 │               Unified Svelte 5 Guest UI              │
 │  (Chromium Kiosk App: shared visual design system,      │
 │   countdown animations, touch/button UI, QR codes)      │
 └────────────────────────────┬────────────────────────────┘
                              │ Local WebSockets / IPC
 ┌────────────────────────────▼────────────────────────────┐
 │               Unified Node.js / Bun Daemon              │
 │  (State machine, upload manager, event dispatcher)       │
 ├─────────────────────────────────────────────────────────┤
 │         Hardware & Media Abstraction Layer (HAL)        │
 │ ┌───────────────────┬───────────────────┬─────────────┐ │
 │ │  Camera Engine    │   Audio Engine    │ Print/GPIO  │ │
 │ │ (libcamera/gphoto)│  (ALSA / ffmpeg)  │(CUPS/USB/IN)│ │
 │ └───────────────────┴───────────────────┴─────────────┘ │
 └─────────────────────────────────────────────────────────┘
```

### Core Technologies
- **Local Booth Daemon:** Node.js 20+ / Bun (Runs locally on Pi or Mini-PC)
- **Local Guest UI:** Svelte 5 (Runes) + Vite, executed in Chromium Fullscreen Kiosk Mode (`DISPLAY=:0`)
- **Cloud Backend & CMS:** Sanity.io (Event schemas, asset storage, real-time listeners)
- **Web Gallery:** SvelteKit hosted on Netlify (`iaevent.pics`)
- **Image Compositor:** `sharp` / Node Canvas (Sub-100ms multi-frame composition)
- **Video & Audio Processor:** `ffmpeg` / `sox` / ALSA / WebAudio API
- **Hardware Drivers:** `libcamera-vid` / `gphoto2` / `v4l2loopback` / Node `onoff` / `serialport`

---

## 3. Supported Hardware Tiers & Modalities

| Feature / Modality | Mode A: Photo Booth | Mode B: Audio Guestbook | Mode C: Video Guestbook |
| :--- | :--- | :--- | :--- |
| **Primary Target Hardware** | Raspberry Pi 4/5 or Mini-PC | Raspberry Pi Zero 2W / Pi 4 | Intel N100 / AMD Ryzen Mini-PC |
| **Primary Input Sensor** | Pi HQ Camera Module / DSLR | Vintage Payphone Handset (Hook Switch + Mic) | USB 4K Webcam / DSLR + Rugged Handheld Dynamic Mic |
| **Physical Controls** | GPIO Buttons, Arcade USB, Touchscreen | Handset Hook Switch (Off-hook / On-hook) | Touchscreen / USB Arcade Button |
| **Media Output** | 4x6 / 2x6 Photo Composite (JPG/PNG) | Audio Recording (WAV/MP3) + Waveform MP4 | 1080p/4K Video Clip (MP4) + Poster GIF |
| **Physical Output** | CUPS Dye-Sub Printing | N/A | Optional Snapshot Print |
| **Cloud Distribution** | Web Gallery + QR Code | Web Audio Player + QR Code | Web Video Player + QR Code |

---

## 4. Detailed Functional Requirements

### 4.1 Mode A: Photo Booth (Replacing Pygame `pibooth`)
* **Live Preview:** Low-latency live camera stream rendered on local Svelte 5 UI with countdown overlay.
* **Capture Sequence:** 
  1. Idle / Attract Loop (dynamic event theme, colors, title).
  2. Start Trigger (Touch screen press or physical GPIO button).
  3. Countdown (e.g., 3-2-1 visual timer with audio tick sounds).
  4. Multi-Photo Capture (1 to 4 frames configured via Sanity).
  5. Flash Effect (Screen white flash trigger / external sync).
  6. Instant Compositing (`sharp` merges captures with event overlay PNG & custom metadata).
  7. Output Screen (Displays composite image, QR code pointing to `iaevent.pics/[pictureId]`, and optional Print button).
* **Printing Pipeline:** Direct local printing via CUPS (`lpr`), respecting max print limits and admin print triggers from Sanity.

### 4.2 Mode B: Audio Guestbook (Vintage Payphone Integration)
* **Hardware Setup:** Vintage repainted payphone equipped with a microphone/earpiece and a handset hook switch connected to GPIO / USB encoder.
* **User Workflow:**
  1. **Idle State:** Phone sits on hook (`On-Hook`).
  2. **Greeting Playback:** Guest lifts handset (`Off-Hook`). Daemon detects state change and instantly plays the host’s custom audio greeting through the earpiece.
  3. **Beep & Record:** Following greeting, a tone ("beep") plays, and audio recording begins immediately from the handset microphone.
  4. **Hang-Up / Complete:** Guest hangs up (`On-Hook`). Recording stops instantly, files are saved locally.
  5. **Post-Processing:** 
     - Noise reduction filter applied via `ffmpeg`/`sox`.
     - MP4 visualizer video generated combining audio waveform + event branding overlay.
     - Uploaded to Sanity and linked to event gallery for online playback.

### 4.3 Mode C: Video Guestbook (High-Performance Mini-PC)
* **Audio & Loud Environment Isolation:**
  * **Dedicated Close-Talk / Directional Microphone:** Supports external high-durability handheld dynamic microphones (e.g., Shure SM58 / USB stage mics) or directional shotguns mounted to the booth frame to isolate guest voices from loud DJ/band background music.
  * **Drop & Impact Resistance:** Hardware spec accommodates ruggedized handheld mics built to withstand guests dropping or passing the microphone around.
  * **Software Audio Processing:** The daemon applies `ffmpeg` audio filters during recording/encoding (Noise Gate, High-Pass filter to cut low-end room rumble/bass, and dynamic voice compression) to ensure crisp, intelligible speech.
* **User Workflow:**
  1. **Attract State:** Video prompt on screen ("Leave a video message for the hosts!").
  2. **Recording State:** Touch screen start -> 3-2-1 countdown -> Live preview video recording with isolated audio input.
  3. **Duration Controls:**
     - **Fixed Mode (Default):** 60-second strict limit with visual countdown bar on screen. Auto-stops at 60s.
     - **Unlimited Mode:** Count-up timer displayed (`00:45`, `01:15`, etc.). Every 60 seconds, a subtle visual pulse animation/alert alerts the guest of message length.
  4. **Review & Submit:** Guest can re-play video locally, re-record, or submit.
  5. **Encoding & Upload:** Local hardware-accelerated MP4 encoding (H.264/AAC), animated GIF thumbnail creation, and upload to Sanity.


---

## 5. Software Architecture & Shared Components

### 5.1 Hardware Abstraction Layer (HAL)
The daemon isolates hardware drivers behind a unified event-driven JavaScript API:

```typescript
interface HardwareAbstractionLayer {
  // Camera
  startPreview(): Promise<MediaStream | string>;
  capturePhoto(): Promise<string>;
  startVideoRecording(options: VideoOptions): Promise<void>;
  stopVideoRecording(): Promise<string>;
  
  // Audio
  playAudio(filePath: string, outputDevice?: string): Promise<void>;
  startAudioRecording(options: AudioOptions): Promise<void>;
  stopAudioRecording(): Promise<string>;
  
  // Triggers & GPIO
  onInput(event: 'button_press' | 'hook_off' | 'hook_on', callback: () => void): void;
  setLED(ledId: string, state: boolean): void;
  
  // Printer
  printImage(filePath: string, copies: number): Promise<boolean>;
}
```

### 5.2 Offline Resiliency & Queue Management
* All captures (Photos, Audio WAVs, Video MP4s) are immediately written to local disk (`/var/ia-booth/queue/`).
* A local SQLite database tracks upload status (`pending`, `uploading`, `synced`, `failed`).
* A background background worker continuously flushes pending items to Sanity when an active internet connection is detected.
* QR codes are generated deterministically using pre-calculated UUIDs so printed QR codes work even before cloud sync completes.

### 5.3 Sanity CMS Extensions (`studio/schemaTypes/`)
The existing Sanity schema is extended to support multi-modal booth management:

```typescript
// Sanity Event Schema Additions
export default {
  name: 'event',
  fields: [
    {
      name: 'boothMode',
      title: 'Booth Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Photo Booth', value: 'photo' },
          { title: 'Audio Guestbook', value: 'audio' },
          { title: 'Video Guestbook', value: 'video' },
        ]
      }
    },
    {
      name: 'audioGreeting',
      title: 'Audio Guestbook Greeting Prompt',
      type: 'file',
      hidden: ({ document }) => document?.boothMode !== 'audio'
    },
    {
      name: 'videoDurationMode',
      title: 'Video Duration Mode',
      type: 'string',
      options: {
        list: [
          { title: '60 Seconds Fixed', value: 'fixed_60' },
          { title: 'Unlimited (with 60s pulse reminder)', value: 'unlimited' }
        ]
      },
      hidden: ({ document }) => document?.boothMode !== 'video'
    }
  ]
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation & HAL Architecture
- Create unified Node.js/Bun daemon project structure in `/daemon` or `/scripts/v2`.
- Implement local WebSocket server for IPC between daemon and local UI.
- Build Hardware Abstraction Layer (HAL) for Pi HQ Camera (`libcamera`), USB Webcams, and GPIO/Serial inputs.

### Phase 2: Photo Booth Module (Pygame Deprecation)
- Build local Svelte 5 Kiosk UI application (Countdown, Live Preview Canvas, Composite Viewer, QR Code).
- Implement `sharp`-based image compositor to replace Python image rendering.
- Wire CUPS local printing and Sanity upload queue.

### Phase 3: Audio Payphone Guestbook Module
- Build GPIO/Serial hook-switch listener in daemon.
- Integrate ALSA/SoX audio playback (host greeting) and microphone recording pipeline.
- Implement automated WAV to MP4 waveform video generator for web gallery playback.

### Phase 4: Video Guestbook Module (Mini-PC Pipeline)
- Build `ffmpeg` hardware-accelerated video recording engine for x86 Mini-PC.
- Implement Svelte 5 video recording UI (fixed 60s countdown & unlimited count-up timer with 60s pulse indicator).
- Add MP4 video player to `iaevent.pics` gallery.

### Phase 5: Verification, Integration & Deployment
- Test on Raspberry Pi 4 (Photo & Audio modes) and x86 Mini-PC (Video mode).
- Verify real-time CMS theme synchronization without service restart.
- Finalize documentation and update `AGENTS.md`.
