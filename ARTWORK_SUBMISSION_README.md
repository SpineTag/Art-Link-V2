# Artwork Submission System

This system allows artists to submit artworks for display on the Art Link website using a Vercel-friendly API and Supabase for persistence.

## Features

- Artists can submit artwork with title, description, category, price, and image
- Artwork images upload to Supabase storage
- Artwork metadata is saved in a Supabase table
- Visitors can browse approved artworks in the gallery
- Visitors can contact artists directly from the gallery modal

## How to Use

### For Artists

1. Go to the "Submit Art" page
2. Fill out the form and upload an artwork image
3. Agree to the submission consent
4. Submit your artwork for review

### For Admins

1. Approve submitted artworks inside Supabase
2. Only approved artworks appear in the gallery
3. Use the Supabase dashboard to manage images and records

### For Visitors

1. Browse the gallery
2. Click an artwork to open the viewer
3. Use "Contact Artist" to message the artist

## File Structure

- `pages/submit-artwork.html` - Artwork submission page
- `css/pages/submit-artwork.css` - Styles for submission page
- `pages/gallery.html` - Gallery page with dynamic artwork loading
- `js/main.js` - Client logic for forms and gallery
- `api/submit-artwork.js` - Vercel API upload endpoint
- `api/artworks.js` - Vercel API fetch endpoint
- `vercel.json` - Vercel deployment settings

## Supabase Setup

1. Create a Supabase project
2. Create a storage bucket named `artworks`
   - Set the bucket to public so images are accessible
3. Create a table named `artworks` with columns:
   - `id` (uuid or text primary key)
   - `artist_name` (text)
   - `artist_email` (text)
   - `artist_bio` (text)
   - `artwork_title` (text)
   - `artwork_description` (text)
   - `artwork_category` (text)
   - `artwork_price` (numeric)
   - `image_url` (text)
   - `approved` (boolean)
   - `submitted_at` (timestamp)

Example SQL:

```sql
create table artworks (
  id text primary key,
  artist_name text not null,
  artist_email text not null,
  artist_bio text,
  artwork_title text not null,
  artwork_description text not null,
  artwork_category text not null,
  artwork_price numeric,
  image_url text not null,
  approved boolean default false,
  submitted_at timestamp default now()
);
```

## Environment Variables

Set these in Vercel or your local environment:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `CONTACT_RECEIVER` - Email to receive contact form submissions (optional)

## Deployment

1. Commit your changes to GitHub
2. Deploy on Vercel
3. Vercel will serve static pages and the API functions from `api/`

## Notes

- This implementation uses Supabase for persistent storage
- The gallery loads only `approved` artworks
- New submissions require admin approval before appearing live
- The contact form still uses your current Google Forms workflow
</content>
<parameter name="filePath">c:\Users\user\Documents\Art-Link-V2\ARTWORK_SUBMISSION_README.md