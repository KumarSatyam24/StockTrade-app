import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketData } from '../types/market';

const POLLING_INTERVAL = 3000; // 3 seconds

interface MarketContextType {
  marketData: MarketData;
  isLoading: boolean;
}

const MarketContext = createContext<MarketContextType>({
  marketData: {},
  isLoading: true
});

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [marketData, setMarketData] = useState<MarketData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of all stocks
    fetchAllStocks();

    // Set up real-time subscription
    const channel = supabase
      .channel('market-data')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stocks'
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

    async function fetchAllStocks() {
      const { data, error } = await supabase
        .from('stocks')
        .select('symbol, current_price, day_change, day_change_percent, volume');

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
        setIsLoading(false);
      }
    }

    // Polling fallback
    const pollInterval = setInterval(fetchAllStocks, POLLING_INTERVAL);

    return () => {
      clearInterval(pollInterval);
      channel.unsubscribe();
    };
  }, []);

  return (
    <MarketContext.Provider value={{ marketData, isLoading }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}