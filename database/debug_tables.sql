-- Debug SQL: Check table names and relationships
-- Run this in your Supabase SQL Editor to check your actual table structure

-- 1. Check all table names
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- 2. Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (tc.table_name = 'products' OR tc.table_name = 'ProductImages');

-- 3. Check if ProductImages table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ProductImages'
AND table_schema = 'public';

-- 4. Check if products table exists  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
AND table_schema = 'public';
