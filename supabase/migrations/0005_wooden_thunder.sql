/*
  # Create stocks table and related functions

  1. New Tables
    - `stocks`
      - `symbol` (text, primary key) - Stock symbol/ticker
      - `name` (text) - Company name
      - `sector` (text) - Industry sector
      - `current_price` (numeric) - Current stock price
      - `previous_close` (numeric) - Previous day's closing price
      - `day_change` (numeric) - Price change for the day
      - `day_change_percent` (numeric) - Percentage change for the day
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on stocks table
    - Add policy for authenticated users to read stocks data
    - Add policy for service role to update stock data
*/

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  sector text,
  current_price numeric NOT NULL CHECK (current_price > 0),
  previous_close numeric NOT NULL CHECK (previous_close > 0),
  day_change numeric NOT NULL,
  day_change_percent numeric NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read stocks"
  ON stocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to update stocks"
  ON stocks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update stock prices
CREATE OR REPLACE FUNCTION update_stock_price(
  p_symbol text,
  p_current_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stocks
  SET 
    previous_close = current_price,
    current_price = p_current_price,
    day_change = p_current_price - current_price,
    day_change_percent = ((p_current_price - current_price) / current_price) * 100,
    updated_at = now()
  WHERE symbol = p_symbol;
END;
$$;