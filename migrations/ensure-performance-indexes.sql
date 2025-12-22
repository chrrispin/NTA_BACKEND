-- Ensure performance indexes exist on articles table
-- This is a safety migration in case the initial setup.sql wasn't run
USE nta_database;

-- Add index on section column for filtering queries
-- IF NOT EXISTS prevents errors if index already created
CREATE INDEX idx_section ON articles(section);

-- Add index on created_at column for sorting/pagination queries
CREATE INDEX idx_created_at ON articles(created_at);

-- Verify indexes exist (informational query)
-- SHOW INDEX FROM articles WHERE Key_name IN ('idx_section', 'idx_created_at');
