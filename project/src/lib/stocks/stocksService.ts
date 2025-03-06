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
      // Insert stocks in batches to avoid payload size limits
      const batchSize = 10;
      for (let i = 0; i < NIFTY50_STOCKS.length; i += batchSize) {
        const batch = NIFTY50_STOCKS.slice(i, i + batchSize);
        const { error } = await supabase
          .from('stocks')
          .upsert(batch, { 
            onConflict: 'symbol',
            ignoreDuplicates: true 
          });

        if (error) throw error;
      }
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
    
    // Ensure we have stocks data, if not initialize and fetch again
    if (!data?.length) {
      await initializeStocksTable();
      const { data: refreshedData, error: refreshError } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');
        
      if (refreshError) throw refreshError;
      return refreshedData || [];
    }

    return data;
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