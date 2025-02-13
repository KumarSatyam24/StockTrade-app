/*
  # Add project changes tracking

  1. New Tables
    - `project_changes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `description` (text)
      - `category` (text) - e.g., 'feature', 'bugfix', 'improvement'
      - `files_changed` (text[])
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `project_changes` table
    - Add policy for authenticated users to manage their changes
*/

CREATE TABLE IF NOT EXISTS project_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  category text NOT NULL,
  files_changed text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project changes"
  ON project_changes
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_project_changes_user_date 
ON project_changes(user_id, created_at DESC);