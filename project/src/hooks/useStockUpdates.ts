import { useState, useEffect } from 'react';
import { generateStockUpdate } from '../utils/stocks';
import type { Stock } from '../types';

export function useStockUpdates(initialStocks: Stock[]) {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => generateStockUpdate(stock))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stocks;
}