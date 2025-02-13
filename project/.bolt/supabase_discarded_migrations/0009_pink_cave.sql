/*
  # Add initial stocks data
  
  1. Changes
    - Insert initial stock data from mockData.ts into stocks table
  
  2. Security
    - No security changes needed as we're just inserting data
*/

INSERT INTO stocks (
  symbol,
  name,
  sector,
  current_price,
  previous_close,
  day_change,
  day_change_percent,
  volume,
  market_cap,
  pe_ratio
) VALUES 
  ('TCS', 'Tata Consultancy Services Ltd.', 'Information Technology', 3567.40, 3545.20, 22.20, 0.63, 1234567, 1298765400000, 27.8),
  ('INFY', 'Infosys Ltd.', 'Information Technology', 1478.65, 1465.30, 13.35, 0.91, 2345678, 876543200000, 24.5),
  ('HCLTECH', 'HCL Technologies Ltd.', 'Information Technology', 1245.30, 1238.45, 6.85, 0.55, 987654, 456789100000, 21.3),
  ('HDFCBANK', 'HDFC Bank Ltd.', 'Financial Services', 1678.90, 1665.45, 13.45, 0.81, 3456789, 934567800000, 19.4),
  ('ICICIBANK', 'ICICI Bank Ltd.', 'Financial Services', 945.75, 938.20, 7.55, 0.80, 4567890, 765432100000, 18.7),
  ('SBIN', 'State Bank of India', 'Financial Services', 567.85, 564.30, 3.55, 0.63, 5678901, 543210900000, 12.4),
  ('RELIANCE', 'Reliance Industries Ltd.', 'Oil & Gas', 2457.85, 2445.30, 12.55, 0.51, 5234567, 1665432100000, 22.5),
  ('ONGC', 'Oil & Natural Gas Corporation Ltd.', 'Oil & Gas', 178.45, 176.90, 1.55, 0.88, 6789012, 234567800000, 8.9),
  ('TATAMOTORS', 'Tata Motors Ltd.', 'Automobiles', 678.90, 672.45, 6.45, 0.96, 7890123, 345678900000, 15.8),
  ('M&M', 'Mahindra & Mahindra Ltd.', 'Automobiles', 1567.30, 1558.75, 8.55, 0.55, 2345678, 234567800000, 17.6),
  ('HINDUNILVR', 'Hindustan Unilever Ltd.', 'Consumer Goods', 2456.75, 2445.30, 11.45, 0.47, 890123, 876543200000, 32.4),
  ('ITC', 'ITC Ltd.', 'Consumer Goods', 445.65, 442.30, 3.35, 0.76, 9012345, 654321900000, 25.7),
  ('SUNPHARMA', 'Sun Pharmaceutical Industries Ltd.', 'Healthcare', 1123.45, 1118.90, 4.55, 0.41, 1234567, 432109800000, 28.9),
  ('DRREDDY', 'Dr. Reddy''s Laboratories Ltd.', 'Healthcare', 5678.90, 5665.45, 13.45, 0.24, 345678, 321098700000, 31.2),
  ('LT', 'Larsen & Toubro Ltd.', 'Construction', 2789.65, 2776.20, 13.45, 0.48, 2345678, 765432100000, 20.8),
  ('TATASTEEL', 'Tata Steel Ltd.', 'Metals', 134.55, 133.20, 1.35, 1.01, 8901234, 234567800000, 9.7),
  ('HINDALCO', 'Hindalco Industries Ltd.', 'Metals', 567.85, 564.30, 3.55, 0.63, 4567890, 198765400000, 11.3),
  ('MINDTREE', 'MindTree Ltd.', 'Information Technology', 4567.85, 4545.30, 22.55, 0.50, 345678, 87654320000, 29.4),
  ('PFC', 'Power Finance Corporation Ltd.', 'Financial Services', 245.65, 243.20, 2.45, 1.01, 5678901, 76543210000, 8.9),
  ('HAVELLS', 'Havells India Ltd.', 'Consumer Goods', 1345.75, 1338.20, 7.55, 0.56, 234567, 98765430000, 26.8)
ON CONFLICT (symbol) 
DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  current_price = EXCLUDED.current_price,
  previous_close = EXCLUDED.previous_close,
  day_change = EXCLUDED.day_change,
  day_change_percent = EXCLUDED.day_change_percent,
  volume = EXCLUDED.volume,
  market_cap = EXCLUDED.market_cap,
  pe_ratio = EXCLUDED.pe_ratio;