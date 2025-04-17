import { useState, useEffect } from 'react';
import { useMarketData } from './useMarketData';
import type { Portfolio } from '../types';

export function usePortfolioUpdates(initialPortfolio: Portfolio[]): Portfolio[] {
  const symbols = initialPortfolio.map(p => p.stock_symbol);
  const marketData = useMarketData(symbols);
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  useEffect(() => {
    // Update portfolio with latest market data
    const updatedPortfolio = initialPortfolio.map(holding => ({
      ...holding,
      current_price: marketData[holding.stock_symbol]?.price || holding.current_price,
      day_change: marketData[holding.stock_symbol]?.change || (holding.current_price - holding.previous_day_price),
      day_change_percent: marketData[holding.stock_symbol]?.changePercent || 
        ((holding.current_price - holding.previous_day_price) / holding.previous_day_price * 100)
    }));

    setPortfolio(updatedPortfolio);
  }, [initialPortfolio, marketData]);

  return portfolio;
}