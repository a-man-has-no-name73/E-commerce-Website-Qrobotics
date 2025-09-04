-- UserAddresses Table (converted to lowercase for PostgreSQL)
CREATE TABLE IF NOT EXISTS useraddresses (
  address_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  address_type VARCHAR(10) CHECK (address_type IN ('billing', 'shipping')) NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_useraddresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_useraddresses_updated_at 
    BEFORE UPDATE ON useraddresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_useraddresses_updated_at();
