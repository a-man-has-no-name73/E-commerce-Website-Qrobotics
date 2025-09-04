-- Add updated_at column to users table
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have the current timestamp  
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
