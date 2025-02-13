/*
  # Add trigger for automatic profile creation
  
  1. Changes
    - Create a function to handle new user creation
    - Add trigger to automatically create profile records
  
  2. Security
    - Function is owned by postgres to ensure it has necessary permissions
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();