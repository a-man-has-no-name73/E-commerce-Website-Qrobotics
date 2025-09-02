-- Add product_code column to products table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the product_code column
alter table products add column product_code

varchar(50);

-- Step 1b: Add unique constraint
alter table products add constraint unique_product_code unique ( product_code );

-- Step 2: Create an index for better performance
create index if not exists idx_products_product_code on
   products (
      product_code
   );

-- Step 3: Add a comment to describe the column
comment on column products.product_code is
   'Unique product code for identification and display';

-- Verify the changes
select column_name,
       data_type,
       is_nullable,
       column_default
  from information_schema.columns
 where table_name = 'products'
   and table_schema = 'public'
 order by ordinal_position;

-- Optional: View some sample data to verify the structure
select product_id,
       name,
       product_code,
       price,
       created_at
  from products
 order by created_at desc;