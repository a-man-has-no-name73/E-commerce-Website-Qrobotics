-- Step 1: Add serial_number column to existing productimages table
-- Run this in your Supabase SQL Editor

-- Add the serial_number column
ALTER TABLE productimages 
ADD COLUMN serial_number integer DEFAULT 1;

-- Update existing records to set proper serial numbers
-- Primary images get serial_number = 1, others get sequential numbers
WITH numbered_images AS (
  SELECT 
    image_id,
    ROW_NUMBER() OVER (
      PARTITION BY product_id 
      ORDER BY 
        CASE WHEN is_primary = true THEN 0 ELSE 1 END,
        created_at ASC
    ) as row_num
  FROM productimages
)
UPDATE productimages 
SET serial_number = numbered_images.row_num
FROM numbered_images
WHERE productimages.image_id = numbered_images.image_id;

-- Add constraint to ensure serial_number is positive
ALTER TABLE productimages 
ADD CONSTRAINT chk_serial_number_positive 
CHECK (serial_number > 0);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_serial 
ON productimages(product_id, serial_number);

-- Verify the changes (optional - run this to check)
-- SELECT product_id, image_id, serial_number, is_primary, file_name, created_at 
-- FROM productimages 
-- ORDER BY product_id, serial_number;
