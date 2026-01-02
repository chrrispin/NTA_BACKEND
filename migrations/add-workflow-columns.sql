-- Add workflow columns to articles table for approval process
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft' COMMENT 'draft, pending_admin_review, pending_super_admin_review, approved, rejected, published';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_by INT COMMENT 'User ID who submitted the article';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NULL COMMENT 'When article was submitted for review';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_by INT COMMENT 'User ID who approved the article';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL COMMENT 'When article was approved';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS rejection_reason TEXT COMMENT 'Reason for rejection if article was rejected';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS current_reviewer_role VARCHAR(50) COMMENT 'admin or super_admin - who needs to review next';

-- Add indexes for workflow queries
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_status (status);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_submitted_by (submitted_by);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_approved_by (approved_by);
ALTER TABLE articles ADD INDEX IF NOT EXISTS idx_current_reviewer_role (current_reviewer_role);
