/*
  # Fix profile policies and triggers

  1. Changes
    - Drop existing profile policies
    - Add new policies for profile management
    - Update trigger security

  2. Security
    - Allow users to insert their own profile
    - Allow users to read their own profile
    - Allow the trigger to create profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can manage own profile"
  ON profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the trigger to create profiles
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;