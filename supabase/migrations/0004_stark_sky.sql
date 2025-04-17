/*
  # Add wishlist functionality

  1. New Tables
    - `wishlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `stock_symbol` (text)
      - `target_price` (numeric)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on wishlist table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  target_price numeric NOT NULL CHECK (target_price > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlist
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);