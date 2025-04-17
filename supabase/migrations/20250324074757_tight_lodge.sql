/*
  # Initial Database Setup
  
  1. Core Tables
    - `profiles`: User profile data
    - `stocks`: Stock market data
    - `user_funds`: User account balances
    - `fund_transactions`: Money deposit/withdrawal records
    - `portfolios`: User stock holdings
    - `transactions`: Stock trade records
    - `wishlist`: User stock watchlist

  2. Security
    - Enable RLS on all tables
    - Set up authentication triggers
    - Create security policies
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  sector text,
  current_price numeric NOT NULL CHECK (current_price > 0),
  previous_close numeric NOT NULL CHECK (previous_close > 0),
  day_change numeric NOT NULL,
  day_change_percent numeric NOT NULL,
  volume bigint,
  market_cap bigint,
  pe_ratio numeric,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_funds table
CREATE TABLE IF NOT EXISTS user_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create fund_transactions table
CREATE TABLE IF NOT EXISTS fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL')),
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'COMPLETED',
  created_at timestamptz DEFAULT now()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  quantity numeric(18,2) NOT NULL CHECK (quantity >= 0),
  average_price numeric(18,2) NOT NULL CHECK (average_price > 0),
  current_price numeric(18,2) DEFAULT 0,
  previous_day_price numeric(18,2) DEFAULT 0,
  profit_loss numeric GENERATED ALWAYS AS ((current_price - average_price) * quantity) STORED,
  profit_loss_percentage numeric GENERATED ALWAYS AS (
    CASE 
      WHEN average_price > 0 
      THEN ((current_price - average_price) / average_price * 100)
      ELSE 0
    END
  ) STORED,
  last_price_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price > 0),
  total numeric NOT NULL CHECK (total > 0),
  created_at timestamptz DEFAULT now()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  target_price numeric NOT NULL CHECK (target_price > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;