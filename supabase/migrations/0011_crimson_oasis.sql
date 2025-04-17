/*
  # Fix portfolio schema and triggers

  1. Changes
    - Add profit_loss and profit_loss_percentage columns
    - Update trigger to calculate these values
    - Add proper indexes for performance
    - Add proper constraints

  2. Security
    - Maintain existing RLS policies
*/

-- First drop existing trigger
DROP TRIGGER IF EXISTS maintain_portfolio_day_fields ON portfolios;
DROP FUNCTION IF EXISTS update_portfolio_prices();

-- Add profit/loss columns if they don't exist
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS profit_loss numeric(18,2) GENERATED ALWAYS AS (
  (current_price - average_price) * quantity
) STORED,
ADD COLUMN IF NOT EXISTS profit_loss_percentage numeric(18,2) GENERATED ALWAYS AS (
  CASE 
    WHEN average_price > 0 
    THEN ((current_price - average_price) / average_price * 100)
    ELSE 0
  END
) STORED;

-- Create new function to handle price updates
CREATE OR REPLACE FUNCTION update_portfolio_prices()
RETURNS trigger AS $$
BEGIN
  -- If it's a new day or first update, set previous day price
  IF (
    NEW.last_price_update IS NULL OR 
    DATE(NEW.last_price_update) < DATE(now()) OR
    OLD.previous_day_price IS NULL
  ) THEN
    NEW.previous_day_price := COALESCE(OLD.current_price, NEW.current_price);
  END IF;
  
  NEW.last_price_update := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER maintain_portfolio_prices
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  WHEN (
    NEW.current_price IS DISTINCT FROM OLD.current_price OR
    NEW.last_price_update IS NULL
  )
  EXECUTE FUNCTION update_portfolio_prices();

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_portfolios_user_symbol 
ON portfolios(user_id, stock_symbol);

CREATE INDEX IF NOT EXISTS idx_portfolios_symbol 
ON portfolios(stock_symbol);

-- Add constraints to ensure data integrity
ALTER TABLE portfolios
  DROP CONSTRAINT IF EXISTS quantity_not_negative,
  DROP CONSTRAINT IF EXISTS average_price_positive,
  DROP CONSTRAINT IF EXISTS current_price_positive,
  DROP CONSTRAINT IF EXISTS previous_day_price_positive;

ALTER TABLE portfolios
  ADD CONSTRAINT quantity_not_negative 
    CHECK (quantity >= 0),
  ADD CONSTRAINT average_price_positive 
    CHECK (average_price > 0),
  ADD CONSTRAINT current_price_positive 
    CHECK (current_price > 0),
  ADD CONSTRAINT previous_day_price_positive 
    CHECK (previous_day_price > 0);