/*
  # Add RLS policies for user funds management

  1. Security
    - Enable RLS on user_funds table
    - Add policies for users to:
      - View their own funds
      - Update their own funds
      - Insert their own funds record
    - Ensure users can only access and modify their own data

  2. Changes
    - Enable RLS on user_funds table
    - Add SELECT policy
    - Add UPDATE policy
    - Add INSERT policy
*/

-- Enable RLS
ALTER TABLE user_funds ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own funds
CREATE POLICY "Users can view own funds"
  ON user_funds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own funds
CREATE POLICY "Users can update own funds"
  ON user_funds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own funds record
CREATE POLICY "Users can insert own funds"
  ON user_funds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure a user_funds record is created when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_funds (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;