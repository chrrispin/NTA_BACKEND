-- Add feature flags to articles table for filtering by category
USE nta_database;

-- Add isAudioPick flag for AudioCarousel section
ALTER TABLE articles ADD COLUMN isAudioPick BOOLEAN DEFAULT FALSE AFTER is_live;

-- Add isHot flag for HotNews section
ALTER TABLE articles ADD COLUMN isHot BOOLEAN DEFAULT FALSE AFTER isAudioPick;

-- Add index on these flags for faster filtering
CREATE INDEX idx_isAudioPick ON articles(isAudioPick);
CREATE INDEX idx_isHot ON articles(isHot);
