import { supabase } from '../lib/supabase';
import { NIFTY50_STOCKS } from '../lib/stocks/mockData';
import type { IndianStock } from '../lib/stocks/types';

export async function getStocks(): Promise<IndianStock[]> {
  try {
    console.log('[getStocks] Fetching stocks from Supabase...');
    const { data, error, status, statusText } = await supabase
      .from('stocks')
      .select('*')
      .order('symbol');

    if (error) {
      console.error('[getStocks] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status,
        statusText
      });
      throw error;
    }
    
    console.log('[getStocks] Fetched stocks:', data?.length || 0);
    
    if (!data?.length) {
      console.log('[getStocks] No stocks found, initializing table...');
      await initializeStocksTable();
      
      const { data: refreshedData, error: refreshError } = await supabase
        .from('stocks')
        .select('*')
        .order('symbol');
        
      if (refreshError) {
        console.error('[getStocks] Error refreshing stocks:', refreshError);
        throw refreshError;
      }

      console.log('[getStocks] Initialized with stocks:', refreshedData?.length || 0);
      return refreshedData || NIFTY50_STOCKS;
    }

    return data;
  } catch (error) {
    console.error('[getStocks] Critical error:', error);
    // Log connection details (without sensitive info)
    console.log('[getStocks] Supabase URL configured:', !!supabase.config.supabaseUrl);
    console.log('[getStocks] Supabase Key configured:', !!supabase.config.supabaseKey);
    return NIFTY50_STOCKS;
  }
}

export async function initializeStocksTable() {
  try {
    console.log('[initializeStocksTable] Checking existing stocks...');
    const { data: existingStocks, error: checkError } = await supabase
      .from('stocks')
      .select('symbol')
      .limit(1);

    if (checkError) {
      console.error('[initializeStocksTable] Error checking stocks:', checkError);
      throw checkError;
    }

    if (!existingStocks?.length) {
      console.log('[initializeStocksTable] Initializing stocks table...');
      const batchSize = 10;
      for (let i = 0; i < NIFTY50_STOCKS.length; i += batchSize) {
        const batch = NIFTY50_STOCKS.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('stocks')
          .upsert(batch, { 
            onConflict: 'symbol',
            ignoreDuplicates: true 
          });

        if (insertError) {
          console.error('[initializeStocksTable] Error inserting batch:', insertError);
          throw insertError;
        }
        console.log(`[initializeStocksTable] Inserted batch ${i/batchSize + 1}`);
      }
      console.log('[initializeStocksTable] Initialization complete');
    } else {
      console.log('[initializeStocksTable] Stocks table already initialized');
    }
  } catch (error) {
    console.error('[initializeStocksTable] Critical error:', error);
    throw error;
  }
}