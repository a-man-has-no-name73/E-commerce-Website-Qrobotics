-- Trigger to ensure only one default address per user per address type
-- This will automatically unset other default addresses when a new one is set as default

CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the new/updated record has is_default = TRUE
    IF NEW.is_default = TRUE THEN
        -- Update all other addresses for this user and address_type to not be default
        UPDATE useraddresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
          AND address_type = NEW.address_type 
          AND address_id != NEW.address_id
          AND deleted_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs AFTER INSERT OR UPDATE
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON useraddresses;
CREATE TRIGGER trigger_ensure_single_default_address
    AFTER INSERT OR UPDATE ON useraddresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();

-- Clean up any existing multiple defaults (run this once to fix existing data)
WITH ranked_defaults AS (
    SELECT 
        address_id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, address_type 
            ORDER BY updated_at DESC, created_at DESC
        ) as rn
    FROM useraddresses 
    WHERE is_default = TRUE 
      AND deleted_at IS NULL
)
UPDATE useraddresses 
SET is_default = FALSE 
WHERE address_id IN (
    SELECT address_id 
    FROM ranked_defaults 
    WHERE rn > 1
);
