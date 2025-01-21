import { useState, useEffect, useCallback } from 'react';
import { fetchStockPrices } from '../lib/api/stocks';
import type { Portfolio } from '../types';
import type { PriceMap } from '../lib/types';

const POLLING_INTERVAL = 2000; // 2 seconds

export function useLastTradedPrices(portfolio: Portfolio[]) {
  // Initialize with current prices from portfolio
  const [ltpMap, setLtpMap] = useState<PriceMap>(() => 
    portfolio.reduce((acc, holding) => ({
      ...acc,
      [holding.stock_symbol]: holding.current_price
    }), {})
  );

  const updatePrices = useCallback(async () => {
    if (!portfolio.length) return;

    const symbols = portfolio.map(holding => holding.stock_symbol);
    const prices = await fetchStockPrices(symbols);
    
    if (prices.length) {
      setLtpMap(prev => ({
        ...prev,
        ...prices.reduce((acc, { symbol, current_price }) => ({
          ...acc,
          [symbol]: current_price
        }), {})
      }));
    }
  }, [portfolio]);

  useEffect(() => {
    updatePrices();
    const interval = setInterval(updatePrices, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [updatePrices]);

  return ltpMap;
}