import { supabase } from '../lib/supabase';

export interface DailyPrice {
  date: string;
  open_price: number;
  close_price: number;
  high_price: number;
  low_price: number;
  volume: number;
}

export async function getPriceHistory(symbol: string, days: number = 30): Promise<DailyPrice[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('stock_symbol', symbol)
    .order('date', { ascending: false })
    .limit(days);

  if (error) throw error;
  return data || [];
}

export async function getMultipleStocksPriceHistory(
  symbols: string[],
  days: number = 30
): Promise<Record<string, DailyPrice[]>> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .in('stock_symbol', symbols)
    .order('date', { ascending: false })
    .limit(days * symbols.length);

  if (error) throw error;

  // Group by symbol
  return (data || []).reduce((acc, price) => {
    const symbol = price.stock_symbol;
    if (!acc[symbol]) acc[symbol] = [];
    acc[symbol].push(price);
    return acc;
  }, {} as Record<string, DailyPrice[]>);
}