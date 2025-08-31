-- Add serial number column to ProductImages table
-- Run these commands in your Supabase SQL Editor one by one

-- Step 1: Add the new serial_number column
ALTER TABLE productimages ADD COLUMN serial_number integer DEFAULT 1;

-- Step 2: Update existing records to set serial_number
-- Primary images get serial_number = 1, others get sequential numbers based on creation time
UPDATE productimages 
SET serial_number = subquery.row_num
FROM (
  SELECT 
    image_id,
    ROW_NUMBER() OVER (
      PARTITION BY product_id 
      ORDER BY 
        CASE WHEN is_primary = true THEN 0 ELSE 1 END,
        created_at ASC
    ) as row_num
  FROM productimages
) AS subquery
WHERE productimages.image_id = subquery.image_id;

-- Step 3: Add constraint to ensure serial_number is positive
ALTER TABLE productimages ADD CONSTRAINT chk_serial_number_positive CHECK (serial_number > 0);

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_serial ON productimages(product_id, serial_number);

-- Verify the changes
-- SELECT product_id, image_id, serial_number, is_primary, created_at 
-- FROM productimages 
-- ORDER BY product_id, serial_number;
