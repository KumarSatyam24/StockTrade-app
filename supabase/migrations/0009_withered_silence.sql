/*
  # Add day tracking fields to portfolios

  1. Changes
    - Add current_price to track latest price
    - Add previous_day_price to track opening price
    - Add day tracking fields (change and percentage)
    - Add last_price_update timestamp
    
  2. Notes
    - All new fields have appropriate defaults
    - Previous day price defaults to current price
    - Generated columns for automatic calculations
*/

-- Add price tracking columns first
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS current_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS previous_day_price numeric DEFAULT 0;

-- Update current price for existing records based on average price
UPDATE portfolios 
SET current_price = average_price 
WHERE current_price = 0;

-- Update previous day price for existing records
UPDATE portfolios 
SET previous_day_price = current_price 
WHERE previous_day_price = 0;

-- Add generated columns for day changes
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS day_change numeric GENERATED ALWAYS AS (
  current_price - previous_day_price
) STORED,
ADD COLUMN IF NOT EXISTS day_change_percent numeric GENERATED ALWAYS AS (
  CASE 
    WHEN previous_day_price > 0 
    THEN ((current_price - previous_day_price) / previous_day_price * 100)
    ELSE 0
  END
) STORED,
ADD COLUMN IF NOT EXISTS last_price_update timestamptz DEFAULT now();

-- Create function to update portfolio prices
CREATE OR REPLACE FUNCTION update_portfolio_prices()
RETURNS trigger AS $$
BEGIN
  -- If it's a new day, update previous_day_price
  IF (
    NEW.last_price_update IS NULL OR 
    DATE(NEW.last_price_update) < DATE(now())
  ) THEN
    NEW.previous_day_price := NEW.current_price;
  END IF;
  
  NEW.last_price_update := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain day tracking fields
CREATE OR REPLACE TRIGGER maintain_portfolio_day_fields
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  WHEN (NEW.current_price IS DISTINCT FROM OLD.current_price)
  EXECUTE FUNCTION update_portfolio_prices();