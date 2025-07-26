-- OPTIMAL ProductImages Table Schema for Cloudinary Integration
-- This schema provides full functionality for Cloudinary image management

-- Drop existing table if you want to recreate (BACKUP YOUR DATA FIRST!)
-- DROP TABLE IF EXISTS ProductImages;

-- Create the enhanced ProductImages table
CREATE TABLE ProductImages (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url TEXT NOT NULL,                    -- Use TEXT for unlimited URL length
  cloudinary_public_id VARCHAR(255) NOT NULL, -- Essential for deleting images from Cloudinary
  file_name VARCHAR(255),                     -- Original filename for better UX
  is_primary BOOLEAN DEFAULT FALSE,           -- Mark primary image for product display
  display_order INT DEFAULT 0,               -- Order images for gallery display
  alt_text VARCHAR(255),                      -- SEO and accessibility
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key with CASCADE delete (when product deleted, images auto-deleted)
  FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_product_id (product_id),
  INDEX idx_is_primary (is_primary),
  INDEX idx_display_order (display_order),
  
  -- Ensure only one primary image per product
  UNIQUE KEY unique_primary_per_product (product_id, is_primary, display_order)
);

-- Alternative if you want to modify existing table instead of recreating:
-- (Run these commands one by one in your database)

/*
ALTER TABLE ProductImages 
MODIFY COLUMN image_url TEXT NOT NULL;

ALTER TABLE ProductImages 
ADD COLUMN cloudinary_public_id VARCHAR(255) NOT NULL;

ALTER TABLE ProductImages 
ADD COLUMN file_name VARCHAR(255);

ALTER TABLE ProductImages 
ADD COLUMN display_order INT DEFAULT 0;

ALTER TABLE ProductImages 
ADD COLUMN alt_text VARCHAR(255);

ALTER TABLE ProductImages 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add indexes
CREATE INDEX idx_product_id ON ProductImages(product_id);
CREATE INDEX idx_is_primary ON ProductImages(is_primary);
CREATE INDEX idx_display_order ON ProductImages(display_order);
*/
