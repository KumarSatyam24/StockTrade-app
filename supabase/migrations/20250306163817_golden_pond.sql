/*
  # Add funds management tables

  1. New Tables
    - `user_funds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `balance` (numeric, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fund_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text, either 'DEPOSIT' or 'WITHDRAWAL')
      - `amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

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

-- Enable RLS
ALTER TABLE user_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_funds
CREATE POLICY "Users can view own funds"
  ON user_funds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own funds"
  ON user_funds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for fund_transactions
CREATE POLICY "Users can view own transactions"
  ON fund_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON fund_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update user_funds balance
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

-- Create trigger for fund_transactions
CREATE TRIGGER update_user_funds_after_transaction
  AFTER INSERT ON fund_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_funds();