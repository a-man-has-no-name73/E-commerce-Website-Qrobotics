-- Product Images Table Structure
-- Run this in your Supabase SQL Editor to ensure the table exists with proper structure

CREATE TABLE IF NOT EXISTS product_images (
  image_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  cloudinary_public_id TEXT, -- Store Cloudinary public ID for deletion
  file_name TEXT, -- Store original file name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to read product images
CREATE POLICY IF NOT EXISTS "Allow public read access to product images" 
ON product_images FOR SELECT 
USING (true);

-- Create a policy to allow admins to insert/update/delete product images
CREATE POLICY IF NOT EXISTS "Allow admin write access to product images" 
ON product_images FOR ALL 
USING (true); -- You might want to restrict this based on user roles

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_product_images_updated_at 
BEFORE UPDATE ON product_images 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
