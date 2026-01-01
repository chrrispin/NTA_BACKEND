-- Add media column to articles table for storing multiple images/videos
ALTER TABLE articles 
ADD COLUMN media JSON AFTER subLinks;
