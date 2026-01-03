# IA Event Pics: Organizer Guide

This guide is for event organizers and photobooth operators to manage photos and branding.

## 🔐 Accessing the Admin Dashboard

1.  Navigate to `https://iaevent.pics/admin`.
2.  Enter the **Admin Password** provided by the system administrator.
3.  Once logged in, you will see a list of all photos taken across all events.

## 🖼️ Managing Photos

### Viewing the Gallery
The admin dashboard shows a chronological list of all photos. You can click on any photo to view it in full size.

### Deleting Photos
If a photo needs to be removed:
1.  Locate the photo in the Admin Dashboard.
2.  Click the **Delete** button next to the image.
3.  **Warning:** This action is permanent and deletes the photo from the storage bucket.

### Overlaid vs. Raw Images
- **Overlaid Images:** The photos with frames and logos that attendees see.
- **Raw Images:** The original high-quality capture without branding. These are hidden from the public gallery but can be managed by admins for marketing purposes.

## 📥 Bulk Download

Organizers can download all photos for an event in a single ZIP file.

1.  Navigate to the Admin Dashboard.
2.  Click the **Download All (ZIP)** button.
3.  The system will prepare the images and provide a progress message (e.g., "Downloading image 5 of 50...").
4.  Once complete, a ZIP file will be downloaded to your computer.

### File Naming Convention
The downloaded ZIP and the images within it use a human-friendly naming convention:
- **ZIP Filename:** `[event-name]_[date].zip`
- **Internal Filenames:** `[event-name]_[timestamp]_[type].jpg`
    - `type` will be `overlaid` or `raw`.

## 🎨 Updating Event Branding

Currently, branding (colors, logos, fonts) is managed by the developer in `src/lib/events.server.js`. 

To request a change:
1.  Contact the developer with the **Event ID**.
2.  Provide the new Hex color codes, font names, or logo files.

---

*For technical support, please contact the lead developer.*
