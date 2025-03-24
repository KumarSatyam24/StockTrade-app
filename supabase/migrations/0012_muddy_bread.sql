/*
  # Update Portfolio Policies and Structure

  1. Changes
    - Drop and recreate RLS policies
    - Add missing columns for price tracking
    - Update portfolio table structure
    - Add proper constraints and indexes

  2. Security
    - Enable RLS
    - Add comprehensive policies for CRUD operations
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Users can read own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can insert into own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;

-- Recreate policies with proper checks
CREATE POLICY "Users can read own portfolio"
  ON portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
  ON portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
  ON portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing constraints first
ALTER TABLE portfolios
  DROP CONSTRAINT IF EXISTS portfolios_quantity_check,
  DROP CONSTRAINT IF EXISTS portfolios_average_price_check,
  DROP CONSTRAINT IF EXISTS portfolios_current_price_check,
  DROP CONSTRAINT IF EXISTS portfolios_previous_price_check,
  DROP CONSTRAINT IF EXISTS quantity_not_negative,
  DROP CONSTRAINT IF EXISTS average_price_positive,
  DROP CONSTRAINT IF EXISTS current_price_positive,
  DROP CONSTRAINT IF EXISTS previous_day_price_positive;

-- Add new constraints
ALTER TABLE portfolios
  ADD CONSTRAINT portfolios_quantity_check CHECK (quantity >= 0),
  ADD CONSTRAINT portfolios_average_price_check CHECK (average_price > 0);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_symbol ON portfolios(user_id, stock_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolios_symbol ON portfolios(stock_symbol);

-- Update function to handle price updates
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

-- Create trigger for price updates
DROP TRIGGER IF EXISTS maintain_portfolio_prices ON portfolios;
CREATE TRIGGER maintain_portfolio_prices
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  WHEN (
    NEW.current_price IS DISTINCT FROM OLD.current_price OR
    NEW.last_price_update IS NULL
  )
  EXECUTE FUNCTION update_portfolio_prices();