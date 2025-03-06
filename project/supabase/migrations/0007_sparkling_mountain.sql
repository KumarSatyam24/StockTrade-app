-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read stocks" ON stocks;
DROP POLICY IF EXISTS "Allow service role to update stocks" ON stocks;

-- Create new policies
CREATE POLICY "Anyone can read stocks"
  ON stocks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage stocks"
  ON stocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;