-- Add quantity column to products table
-- Run this in your Supabase SQL Editor

-- Step 1: Add quantity column to products table
ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0;

-- Step 2: Add check constraint for non-negative quantity
ALTER TABLE products ADD CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0);

-- Step 3: Update existing products to have default quantity of 10
UPDATE products SET quantity = 10 WHERE quantity = 0;

-- Step 4: Create index on quantity for better performance
CREATE INDEX idx_products_quantity ON products(quantity);

-- Step 5: Create index on product_code for search performance  
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);

-- Step 6: Update is_available based on quantity
UPDATE products SET is_available = (quantity > 0);

-- Step 7: Create function to automatically update is_available when quantity changes
CREATE OR REPLACE FUNCTION update_product_availability()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_available = (NEW.quantity > 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create the trigger
DROP TRIGGER IF EXISTS trigger_update_product_availability ON products;
CREATE TRIGGER trigger_update_product_availability
    BEFORE UPDATE OF quantity ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_availability();

-- Step 9: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;
