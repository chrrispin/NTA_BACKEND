-- Add page column to articles table
USE nta_database;

ALTER TABLE articles 
ADD COLUMN page VARCHAR(50) DEFAULT 'Home' AFTER is_live;

-- Add index for page column for better query performance
CREATE INDEX idx_page ON articles(page);

-- Update existing articles to have a page value
UPDATE articles SET page = 'Home' WHERE page IS NULL;

