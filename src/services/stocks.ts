import { supabase } from '../lib/supabase';
import type { IndianStock } from '../lib/stocks/types';

export async function getStocks(): Promise<IndianStock[]> {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
}

export async function getStocksBySymbols(symbols: string[]): Promise<IndianStock[]> {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .in('symbol', symbols)
      .order('symbol');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
}