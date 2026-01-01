-- Add content column to articles table
ALTER TABLE articles 
ADD COLUMN content LONGTEXT AFTER summary;
