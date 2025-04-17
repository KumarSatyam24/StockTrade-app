/*
  # Fix funds management system

  1. Changes
    - Create user_funds table with proper foreign key constraints
    - Add RLS policies for user_funds table
    - Add function to handle new user registration
    - Add trigger to create initial user funds record
    - Ensure proper handling of foreign key relationships

  2. Security
    - Enable RLS on user_funds table
    - Add policies for authenticated users to manage their own funds
    - Maintain referential integrity with profiles table
*/

-- Create user_funds table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_funds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own funds" ON user_funds;
DROP POLICY IF EXISTS "Users can update own funds" ON user_funds;
DROP POLICY IF EXISTS "Users can manage own funds" ON user_funds;

-- Create new RLS policy
CREATE POLICY "Users can manage own funds"
  ON user_funds
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- First ensure the profile exists
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Then create the user_funds record
  INSERT INTO user_funds (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert initial records for existing users
DO $$
BEGIN
  -- First ensure all users have profile records
  INSERT INTO profiles (id, email)
  SELECT id, email
  FROM auth.users
  ON CONFLICT (id) DO NOTHING;
  
  -- Then create user_funds records for all profiles
  INSERT INTO user_funds (user_id, balance)
  SELECT id, 0
  FROM profiles
  ON CONFLICT (user_id) DO NOTHING;
END $$;