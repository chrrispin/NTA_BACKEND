-- Add profile picture column to users table
ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;

-- Add index on profile_picture for optimization
CREATE INDEX idx_profile_picture ON users(profile_picture);
