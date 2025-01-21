import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketData } from '../types/market';

export function useMarketData(symbols: string[]) {
  const [marketData, setMarketData] = useState<MarketData>({});
  
  useEffect(() => {
    if (!symbols.length) return;

    // Initial fetch
    fetchMarketData();

    // Set up real-time subscription
    const channel = supabase
      .channel('market-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stocks',
          filter: `symbol=in.(${symbols.join(',')})`,
        },
        (payload) => {
          setMarketData(prev => ({
            ...prev,
            [payload.new.symbol]: {
              price: payload.new.current_price,
              change: payload.new.day_change,
              changePercent: payload.new.day_change_percent,
              volume: payload.new.volume,
              timestamp: new Date().toISOString()
            }
          }));
        }
      )
      .subscribe();

    async function fetchMarketData() {
      const { data, error } = await supabase
        .from('stocks')
        .select('symbol, current_price, day_change, day_change_percent, volume')
        .in('symbol', symbols);

      if (!error && data) {
        const newData = data.reduce((acc, stock) => ({
          ...acc,
          [stock.symbol]: {
            price: stock.current_price,
            change: stock.day_change,
            changePercent: stock.day_change_percent,
            volume: stock.volume,
            timestamp: new Date().toISOString()
          }
        }), {});
        setMarketData(newData);
      }
    }

    // Polling fallback
    const pollInterval = setInterval(fetchMarketData, 2000);

    return () => {
      clearInterval(pollInterval);
      channel.unsubscribe();
    };
  }, [symbols]);

  return marketData;
}