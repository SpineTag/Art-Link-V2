-- Run this in your Supabase SQL Editor

-- Create the artworks table
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

-- Enable Row Level Security (optional, but good practice)
alter table artworks enable row level security;

-- Create a policy to allow public read access to approved artworks
create policy "Public read approved artworks" on artworks
  for select using (approved = true);

-- Create a policy to allow authenticated users to insert (for submissions)
create policy "Allow inserts" on artworks
  for insert with check (true);