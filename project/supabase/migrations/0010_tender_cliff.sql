/*
  # Update portfolio table constraints and types

  1. Changes
    - Drop trigger and function first
    - Drop generated columns
    - Update column types and add constraints
    - Recreate function and trigger
    - Add performance index
*/

-- First drop the trigger and function
DROP TRIGGER IF EXISTS maintain_portfolio_day_fields ON portfolios;
DROP FUNCTION IF EXISTS update_portfolio_prices();

-- Drop the generated columns
ALTER TABLE portfolios 
DROP COLUMN IF EXISTS day_change,
DROP COLUMN IF EXISTS day_change_percent;

-- Now update the column types and add constraints
ALTER TABLE portfolios
  ALTER COLUMN quantity TYPE numeric(18,2),
  ALTER COLUMN average_price TYPE numeric(18,2),
  ALTER COLUMN current_price TYPE numeric(18,2),
  ALTER COLUMN previous_day_price TYPE numeric(18,2),
  -- Ensure quantity can't be negative
  ADD CONSTRAINT quantity_not_negative CHECK (quantity >= 0),
  -- Ensure prices are positive
  ADD CONSTRAINT average_price_positive CHECK (average_price > 0),
  ADD CONSTRAINT current_price_positive CHECK (current_price > 0),
  ADD CONSTRAINT previous_day_price_positive CHECK (previous_day_price > 0);

-- Recreate the function with better precision
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

-- Recreate the trigger
CREATE TRIGGER maintain_portfolio_day_fields
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  WHEN (NEW.current_price IS DISTINCT FROM OLD.current_price)
  EXECUTE FUNCTION update_portfolio_prices();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_stock 
ON portfolios(user_id, stock_symbol);