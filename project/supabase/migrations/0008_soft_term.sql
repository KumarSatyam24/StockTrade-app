/*
  # Clear portfolio data

  1. Changes
    - Safely removes all data from the portfolios table
    - Maintains table structure and constraints
    - Preserves RLS policies
*/

-- Clear all portfolio data
TRUNCATE TABLE portfolios CASCADE;