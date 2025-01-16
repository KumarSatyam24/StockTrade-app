import { useState, useEffect } from 'react';
import type { Stock } from '../types';
import { generateStockUpdate } from '../utils/stockUtils';

export function useStockUpdates(initialStocks: Stock[]) {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);

  useEffect(() => {
    // Update stocks every second
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => generateStockUpdate(stock))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stocks;
}