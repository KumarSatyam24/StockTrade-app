import { supabase } from '../supabase';
import { NIFTY50_STOCKS } from './mockData';
import type { IndianStock } from './types';

export async function initializeStocksTable() {
  try {
    // First check if we already have stocks
    const { data: existingStocks } = await supabase
      .from('stocks')
      .select('symbol')
      .limit(1);

    // Only initialize if no stocks exist
    if (!existingStocks?.length) {
      const { error } = await supabase
        .from('stocks')
        .upsert(NIFTY50_STOCKS, { 
          onConflict: 'symbol',
          ignoreDuplicates: true 
        });

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error initializing stocks:', error);
    throw error;
  }
}

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