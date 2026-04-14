# Artwork Submission System

This system allows artists to submit their artworks for display on the Art Link website.

## Features

- Artists can submit artworks with details via a form
- Artworks are stored and can be approved for display
- Visitors can view artworks in the gallery
- Visitors can contact artists directly from the gallery

## How to Use

### For Artists

1. Go to the "Submit Art" page
2. Fill out the form with your details and artwork information
3. Upload an image of your artwork (max 5MB, JPG/PNG/GIF)
4. Submit the form

### For Admins

1. Submitted artworks are saved in `data/artworks.json`
2. To approve an artwork for display, set `approved: true` in the JSON file
3. Approved artworks will appear in the gallery

### For Visitors

1. Browse the gallery to see approved artworks
2. Click on an artwork to view details
3. Click "Contact Artist" to send a message (pre-filled with artwork info)

## File Structure

- `pages/submit-artwork.html` - Submission form
- `css/pages/submit-artwork.css` - Styles for submission form
- `server.js` - Backend handling submissions
- `data/artworks.json` - Stored artworks data
- `uploads/` - Uploaded artwork images
- `pages/gallery.html` - Updated gallery with dynamic loading

## Setup

1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. Access the site at `http://localhost:3000`

## Environment Variables

Set these in a `.env` file:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email notifications (optional)
- `CONTACT_RECEIVER` - Email to receive contact form submissions

## Notes

- Artworks require manual approval before appearing in the gallery
- Images are stored in the `uploads/` directory
- The system uses Google Forms for contact submissions</content>
<parameter name="filePath">c:\Users\user\Documents\Art-Link-V2\ARTWORK_SUBMISSION_README.md