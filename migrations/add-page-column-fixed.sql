-- Add page column to articles table
ALTER TABLE articles 
ADD COLUMN page VARCHAR(50) DEFAULT 'Home' AFTER is_live;

-- Add index for page column for better query performance
CREATE INDEX idx_page ON articles(page);
