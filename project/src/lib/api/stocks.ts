import { supabase } from '../supabase';
import type { StockPrice } from '../types';

export async function fetchStockPrices(symbols: string[]): Promise<StockPrice[]> {
  if (!symbols.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('symbol, current_price')
      .in('symbol', symbols);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Failed to fetch stock prices:', err);
    return [];
  }
}