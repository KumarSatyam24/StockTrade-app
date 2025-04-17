/*
  # Database Functions and Triggers Setup
  
  1. Changes
    - Drop existing triggers to avoid conflicts
    - Create/update database functions
    - Create new triggers
    - Add performance indexes
    
  2. Functions
    - handle_new_user: Creates profile and funds record for new users
    - update_portfolio_prices: Maintains portfolio price history
    - update_user_funds: Handles fund transaction updates
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS maintain_portfolio_prices ON portfolios;
DROP TRIGGER IF EXISTS update_user_funds_after_transaction ON fund_transactions;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  RETURNING id INTO profile_id;

  -- Create user_funds record
  INSERT INTO public.user_funds (user_id, balance)
  VALUES (profile_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to update portfolio prices
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

-- Function to update user funds after transactions
CREATE OR REPLACE FUNCTION update_user_funds()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' THEN
    IF NEW.type = 'DEPOSIT' THEN
      INSERT INTO user_funds (user_id, balance)
      VALUES (NEW.user_id, NEW.amount)
      ON CONFLICT (user_id)
      DO UPDATE SET
        balance = user_funds.balance + NEW.amount,
        updated_at = now();
    ELSIF NEW.type = 'WITHDRAWAL' THEN
      UPDATE user_funds
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE user_id = NEW.user_id
      AND balance >= NEW.amount;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER maintain_portfolio_prices
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  WHEN (
    NEW.current_price IS DISTINCT FROM OLD.current_price OR
    NEW.last_price_update IS NULL
  )
  EXECUTE FUNCTION update_portfolio_prices();

CREATE TRIGGER update_user_funds_after_transaction
  AFTER INSERT ON fund_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_funds();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_symbol ON portfolios(user_id, stock_symbol);
CREATE INDEX IF NOT EXISTS idx_portfolios_symbol ON portfolios(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_transactions_user_id ON fund_transactions(user_id);