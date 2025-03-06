/*
  # Update portfolio and transaction policies

  1. Security
    - Update RLS policies for portfolios and transactions tables
    - Add proper checks for user authentication
    - Allow authenticated users to manage their own data

  2. Changes
    - Fix portfolio insert/update policies
    - Add proper transaction policies
*/

-- Drop existing portfolio policies
DROP POLICY IF EXISTS "Users can read own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolios;

-- Create new portfolio policies
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

-- Drop existing transaction policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;

-- Create new transaction policies
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);