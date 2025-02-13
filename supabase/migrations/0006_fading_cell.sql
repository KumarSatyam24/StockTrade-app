ALTER TABLE stocks 
ADD COLUMN IF NOT EXISTS volume bigint,
ADD COLUMN IF NOT EXISTS market_cap bigint,
ADD COLUMN IF NOT EXISTS pe_ratio numeric;