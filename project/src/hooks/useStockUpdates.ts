import { useState, useEffect } from 'react';
import type { IndianStock } from '../lib/stocks/types';

function generateRandomPriceChange(currentPrice: number): number {
  const maxChange = currentPrice * 0.025; // 2.5% max change
  return (Math.random() - 0.5) * maxChange;
}

export function useStockUpdates(initialStocks: IndianStock[]): IndianStock[] {
  const [stocks, setStocks] = useState<IndianStock[]>(initialStocks);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => {
          const priceChange = generateRandomPriceChange(stock.current_price);
          const newPrice = stock.current_price + priceChange;
          
          return {
            ...stock,
            current_price: newPrice,
            day_change: newPrice - stock.previous_close,
            day_change_percent: ((newPrice - stock.previous_close) / stock.previous_close) * 100
          };
        })
      );
    }, 2000); // Changed from 1000 to 2000 milliseconds

    return () => clearInterval(interval);
  }, []);

  // Update when initialStocks changes
  useEffect(() => {
    setStocks(initialStocks);
  }, [initialStocks]);

  return stocks;
}