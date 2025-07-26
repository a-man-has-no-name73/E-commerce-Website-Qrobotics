-- RECOMMENDED: Enhanced ProductImages Table Structure
-- This provides better functionality for managing Cloudinary images

-- First, if you want to modify your existing table:
ALTER TABLE ProductImages 
MODIFY COLUMN image_url VARCHAR(500) NOT NULL, -- Cloudinary URLs can be long
ADD COLUMN cloudinary_public_id VARCHAR(255), -- For image deletion
ADD COLUMN file_name VARCHAR(255), -- Original filename
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- OR, if you want to recreate the table with all improvements:
/*
DROP TABLE IF EXISTS ProductImages;

CREATE TABLE ProductImages (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL, -- Longer for Cloudinary URLs
  cloudinary_public_id VARCHAR(255), -- Store Cloudinary public ID for deletion
  file_name VARCHAR(255), -- Store original filename
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_is_primary (is_primary)
);
*/

-- Benefits of the enhanced structure:
-- 1. Longer URLs (500 chars) - Cloudinary URLs with transformations can be long
-- 2. cloudinary_public_id - Needed to delete images from Cloudinary
-- 3. file_name - Useful for displaying original names to users
-- 4. updated_at - Track when images are modified
-- 5. ON DELETE CASCADE - Automatically delete images when product is deleted
-- 6. Indexes - Better performance for queries
