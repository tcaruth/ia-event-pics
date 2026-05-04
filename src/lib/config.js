// Email configuration
export const BOOKING_EMAIL = 'us@smilewhale.com';

// Email template:
// Subject: Photobooth Booking Inquiry
// Body:
//   Hi!
//
//   Name:
//   Event Date:
//
//   Please contact me regarding booking a photobooth.
//
//   You can reach me at:
//   Email:
//   Phone:

const emailSubject = 'Photobooth Booking Inquiry';
const emailBody = `Hi!

Name: 
Event Date: 

Please contact me regarding booking a photobooth.

You can reach me at:
Email: 
Phone: `;

export const BOOKING_MAILTO_URL = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
