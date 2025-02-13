/*
  # Add daily price history tracking

  1. New Tables
    - `price_history`
      - `id` (uuid, primary key)
      - `stock_symbol` (text, references stocks)
      - `date` (date)
      - `open_price` (numeric)
      - `close_price` (numeric)
      - `high_price` (numeric)
      - `low_price` (numeric)
      - `volume` (bigint)
  
  2. Security
    - Enable RLS on `price_history` table
    - Add policy for authenticated users to read data
*/

CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_symbol text REFERENCES stocks(symbol) ON DELETE CASCADE,
  date date NOT NULL,
  open_price numeric NOT NULL CHECK (open_price > 0),
  close_price numeric NOT NULL CHECK (close_price > 0),
  high_price numeric NOT NULL CHECK (high_price > 0),
  low_price numeric NOT NULL CHECK (low_price > 0),
  volume bigint,
  created_at timestamptz DEFAULT now(),
  UNIQUE(stock_symbol, date)
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read price history"
  ON price_history FOR SELECT
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date 
ON price_history(stock_symbol, date);

-- Function to record daily price history
CREATE OR REPLACE FUNCTION record_daily_price()
RETURNS trigger AS $$
BEGIN
  INSERT INTO price_history (
    stock_symbol,
    date,
    open_price,
    close_price,
    high_price,
    low_price,
    volume
  )
  VALUES (
    NEW.symbol,
    CURRENT_DATE,
    NEW.current_price,
    NEW.current_price,
    NEW.current_price,
    NEW.current_price,
    NEW.volume
  )
  ON CONFLICT (stock_symbol, date)
  DO UPDATE SET
    close_price = NEW.current_price,
    high_price = GREATEST(price_history.high_price, NEW.current_price),
    low_price = LEAST(price_history.low_price, NEW.current_price),
    volume = NEW.volume;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to record price history
CREATE TRIGGER record_stock_price_history
  AFTER UPDATE OF current_price ON stocks
  FOR EACH ROW
  EXECUTE FUNCTION record_daily_price();