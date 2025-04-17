/*
  # Security Policies Setup
  
  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate all security policies
    - Maintain consistent security model
    
  2. Security
    - RLS policies for all tables
    - Authentication checks
    - Data access controls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read stocks" ON stocks;
DROP POLICY IF EXISTS "Authenticated users can manage stocks" ON stocks;
DROP POLICY IF EXISTS "Users can read own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own funds" ON user_funds;
DROP POLICY IF EXISTS "Users can update own funds" ON user_funds;
DROP POLICY IF EXISTS "Users can insert own funds" ON user_funds;
DROP POLICY IF EXISTS "Users can view own fund transactions" ON fund_transactions;
DROP POLICY IF EXISTS "Users can create own fund transactions" ON fund_transactions;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlist;

-- Profile Policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Stock Policies
CREATE POLICY "Anyone can read stocks"
  ON stocks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage stocks"
  ON stocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Portfolio Policies
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
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
  ON portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transaction Policies
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fund Management Policies
CREATE POLICY "Users can view own funds"
  ON user_funds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own funds"
  ON user_funds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own funds"
  ON user_funds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fund Transaction Policies
CREATE POLICY "Users can view own fund transactions"
  ON fund_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fund transactions"
  ON fund_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Wishlist Policies
CREATE POLICY "Users can manage own wishlist"
  ON wishlist
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);